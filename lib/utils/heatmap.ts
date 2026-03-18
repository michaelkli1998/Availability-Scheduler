import { Availability, HeatmapData, TimeSlot } from '@/types/event';

export function calculateHeatmap(
  availabilities: Availability[],
  allSlotIds: string[]
): HeatmapData[] {
  const totalParticipants = availabilities.length;

  if (totalParticipants === 0) {
    return allSlotIds.map((slotId) => ({
      slotId,
      count: 0,
      percentage: 0,
      participants: [],
    }));
  }

  const slotCounts: { [slotId: string]: { count: number; participants: string[] } } = {};

  // Initialize all slots
  allSlotIds.forEach((slotId) => {
    slotCounts[slotId] = { count: 0, participants: [] };
  });

  // Count selections for each slot
  availabilities.forEach((availability) => {
    availability.selectedSlots.forEach((slotId) => {
      if (slotCounts[slotId]) {
        slotCounts[slotId].count++;
        slotCounts[slotId].participants.push(availability.participantName);
      }
    });
  });

  // Convert to HeatmapData array
  return allSlotIds.map((slotId) => ({
    slotId,
    count: slotCounts[slotId].count,
    percentage: (slotCounts[slotId].count / totalParticipants) * 100,
    participants: slotCounts[slotId].participants,
  }));
}

export function getColorIntensity(percentage: number): string {
  if (percentage === 0) {
    return 'bg-gray-100 hover:bg-gray-200';
  } else if (percentage <= 25) {
    return 'bg-indigo-100 hover:bg-indigo-200';
  } else if (percentage <= 50) {
    return 'bg-indigo-300 hover:bg-indigo-400';
  } else if (percentage <= 75) {
    return 'bg-indigo-500 hover:bg-indigo-600 text-white';
  } else {
    return 'bg-indigo-700 hover:bg-indigo-800 text-white';
  }
}

export function findBestSlots(heatmapData: HeatmapData[], topN: number = 3): string[] {
  const sorted = [...heatmapData].sort((a, b) => b.count - a.count);
  return sorted.slice(0, topN).map((data) => data.slotId);
}

export interface BestMeetingTime {
  slotId: string;
  slot: TimeSlot;
  count: number;
  percentage: number;
  participants: string[];
  consecutiveDuration: number; // Number of consecutive slots
}

export function findBestMeetingTime(
  heatmapData: HeatmapData[],
  timeSlots: TimeSlot[],
  options: {
    minThresholdPercent?: number; // Minimum % of people required (default 50%)
    minDurationSlots?: number; // Minimum consecutive slots (default 1)
    maxSuggestions?: number; // Number of suggestions to return (default 3)
  } = {}
): BestMeetingTime[] {
  const {
    minThresholdPercent = 50,
    minDurationSlots = 1,
    maxSuggestions = 3,
  } = options;

  if (heatmapData.length === 0 || timeSlots.length === 0) {
    return [];
  }

  // Create a map for quick slot lookup
  const slotMap = new Map(timeSlots.map(slot => [slot.id, slot]));
  const heatmapMap = new Map(heatmapData.map(data => [data.slotId, data]));

  // Find the maximum availability count (which represents total participants at best slot)
  const maxCount = Math.max(...heatmapData.map(d => d.count));

  if (maxCount === 0) {
    return [];
  }

  // Calculate minimum count based on threshold percentage of max availability
  const minCount = Math.max(1, Math.ceil((minThresholdPercent / 100) * maxCount));

  // Get all slots that meet the minimum threshold
  const qualifyingSlots = heatmapData.filter(d => d.count >= minCount);

  // For each qualifying slot, calculate consecutive duration
  const slotsWithDuration = qualifyingSlots.map(slotData => {
    const slot = slotMap.get(slotData.slotId);
    if (!slot) return null;

    // Calculate consecutive slots with same or better availability
    let consecutiveCount = 1;
    let currentSlot = slot;
    const minCountForConsecutive = slotData.count; // Require same count for consecutive

    // Look ahead for consecutive slots on the same date
    while (true) {
      // Find next time slot on the same date
      const nextSlot = timeSlots.find(s =>
        s.date === currentSlot.date &&
        s.startTime > currentSlot.startTime &&
        // Check if it's the immediate next time slot
        timeSlots.filter(t =>
          t.date === currentSlot.date &&
          t.startTime > currentSlot.startTime &&
          t.startTime < s.startTime
        ).length === 0
      );

      if (!nextSlot) break;

      const nextHeatmap = heatmapMap.get(nextSlot.id);
      if (!nextHeatmap || nextHeatmap.count < minCountForConsecutive) break;

      consecutiveCount++;
      currentSlot = nextSlot;
    }

    return {
      slotId: slotData.slotId,
      slot,
      count: slotData.count,
      percentage: slotData.percentage,
      participants: slotData.participants,
      consecutiveDuration: consecutiveCount,
    };
  }).filter((item): item is BestMeetingTime => item !== null);

  // Filter by minimum duration
  const filteredByDuration = slotsWithDuration.filter(
    item => item.consecutiveDuration >= minDurationSlots
  );

  if (filteredByDuration.length === 0) {
    return [];
  }

  // Sort by availability count (descending), then consecutive duration (descending), then earliest time
  filteredByDuration.sort((a, b) => {
    // First priority: availability count
    if (b.count !== a.count) {
      return b.count - a.count;
    }
    // Second priority: consecutive duration
    if (b.consecutiveDuration !== a.consecutiveDuration) {
      return b.consecutiveDuration - a.consecutiveDuration;
    }
    // Third priority: earlier times
    if (a.slot.date !== b.slot.date) {
      return a.slot.date.localeCompare(b.slot.date);
    }
    return a.slot.startTime.localeCompare(b.slot.startTime);
  });

  // Return top N suggestions, avoiding duplicate consecutive blocks
  const suggestions: BestMeetingTime[] = [];
  const usedSlotIds = new Set<string>();

  for (const item of filteredByDuration) {
    if (suggestions.length >= maxSuggestions) break;

    // Skip if this slot is already part of a previous suggestion's consecutive block
    if (usedSlotIds.has(item.slotId)) continue;

    suggestions.push(item);

    // Mark all slots in this consecutive block as used
    let currentSlot = item.slot;
    usedSlotIds.add(currentSlot.id);

    for (let i = 1; i < item.consecutiveDuration; i++) {
      const nextSlot = timeSlots.find(s =>
        s.date === currentSlot.date &&
        s.startTime > currentSlot.startTime &&
        timeSlots.filter(t =>
          t.date === currentSlot.date &&
          t.startTime > currentSlot.startTime &&
          t.startTime < s.startTime
        ).length === 0
      );
      if (nextSlot) {
        usedSlotIds.add(nextSlot.id);
        currentSlot = nextSlot;
      }
    }
  }

  return suggestions;
}
