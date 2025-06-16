import matplotlib.pyplot as plt
import io
import base64

def plot_signal_and_density(optimizer, green_times):
    """Plot signal timing and density for each lane and return base64-encoded images."""
    lanes = list(optimizer.lanes.keys())
    densities = [optimizer.lanes[l]['density'] for l in lanes]
    priorities = [optimizer.lanes[l]['priority'] for l in lanes]
    green = [green_times[l] for l in lanes]

    charts = {}

    # Vehicle Density by Lane
    plt.figure()
    plt.bar([l.upper() for l in lanes], densities, color="#4e79a7")
    plt.title("Vehicle Density by Lane")
    plt.xlabel("Lane")
    plt.ylabel("Density (%)")
    buf = io.BytesIO()
    plt.savefig(buf, format="png", bbox_inches='tight')
    plt.close()
    buf.seek(0)
    charts["density"] = base64.b64encode(buf.read()).decode("utf-8")

    # Fuzzy Priority Score by Lane
    plt.figure()
    plt.bar([l.upper() for l in lanes], priorities, color="#f28e2b")
    plt.title("Fuzzy Priority Score by Lane")
    plt.xlabel("Lane")
    plt.ylabel("Priority")
    buf = io.BytesIO()
    plt.savefig(buf, format="png", bbox_inches='tight')
    plt.close()
    buf.seek(0)
    charts["priority"] = base64.b64encode(buf.read()).decode("utf-8")

    # Allocated Green Time by Lane
    plt.figure()
    plt.bar([l.upper() for l in lanes], green, color="#59a14f")
    plt.title("Allocated Green Time by Lane")
    plt.xlabel("Lane")
    plt.ylabel("Green Time (s)")
    buf = io.BytesIO()
    plt.savefig(buf, format="png", bbox_inches='tight')
    plt.close()
    buf.seek(0)
    charts["green_time"] = base64.b64encode(buf.read()).decode("utf-8")

    yellow_time = optimizer.yellow_time
    red_times = optimizer.calculate_red_times(green_times)
    total_cycle = optimizer.cycle_time

    # Traffic Signal Cycle Timing Chart
    fig, ax = plt.subplots(figsize=(8, 5))
    y_pos = range(len(lanes))
    for i, lane in enumerate(lanes):
        gt = green_times[lane]
        yt = yellow_time
        rt = red_times[lane]
        # Green bar
        ax.barh(i, gt, color='green', edgecolor='black')
        # Yellow bar (stacked after green)
        ax.barh(i, yt, left=gt, color='yellow', edgecolor='black')
        # Gray bar (stacked after green+yellow)
        ax.barh(i, rt, left=gt+yt, color='lightgray', edgecolor='black')

    ax.set_yticks(list(y_pos))
    ax.set_yticklabels([l.upper() for l in lanes])
    ax.set_xlabel('Time (seconds)')
    ax.set_title('Traffic Signal Cycle Timing')
    ax.set_xlim(0, total_cycle)
    plt.tight_layout()

    buf = io.BytesIO()
    plt.savefig(buf, format="png", bbox_inches='tight')
    plt.close()
    buf.seek(0)
    charts["cycle_timing"] = base64.b64encode(buf.read()).decode("utf-8")

    return charts