import { Availability, HeatmapData } from '@/types/event';

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
