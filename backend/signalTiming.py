import math

def calculate_green_times(lanes, min_green_time, max_green_time, yellow_time, cycle_time):
    green_times = {}
    total_priority = sum(lane['priority'] for lane in lanes.values())
    available_time = cycle_time - (yellow_time * len(lanes))

    for lane_name, lane_data in lanes.items():
        if total_priority > 0:
            ratio = lane_data['priority'] / total_priority
            green_times[lane_name] = max(
                min_green_time,
                min(max_green_time, math.floor(ratio * available_time))
            )
        else:
            green_times[lane_name] = min_green_time

    # Time adjustment
    total_green_time = sum(green_times.values())
    remaining_time = available_time - total_green_time

    if remaining_time != 0:
        sorted_lanes = sorted(
            lanes.keys(), key=lambda lane: lanes[lane]['priority'], reverse=True
        )

        for lane_name in sorted_lanes:
            if remaining_time > 0:
                adjustment = min(remaining_time, max_green_time - green_times[lane_name])
                green_times[lane_name] += adjustment
                remaining_time -= adjustment
            elif remaining_time < 0:
                adjustment = min(-remaining_time, green_times[lane_name] - min_green_time)
                green_times[lane_name] -= adjustment
                remaining_time += adjustment

            if remaining_time == 0:
                break

    return green_times


def calculate_red_times(green_times, yellow_time, cycle_time):
    return {
        lane: max(cycle_time - (green_time + yellow_time), 0)
        for lane, green_time in green_times.items()
    }


def update_waiting_times(lanes, active_lane=None, time_elapsed=1):
    for lane_name in lanes:
        if lane_name != active_lane:
            lanes[lane_name]['waiting_time'] += time_elapsed
        else:
            lanes[lane_name]['waiting_time'] = 0
