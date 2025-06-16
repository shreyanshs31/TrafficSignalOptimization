from skfuzzy import control as ctrl
import numpy as np
import skfuzzy as fuzz
import os
import matplotlib.pyplot as plt

def setup_fuzzy_controller():
    """Set up the fuzzy logic controller for traffic signal timing"""
    # Define fuzzy variables
    vehicle_count = ctrl.Antecedent(np.arange(0, 31, 1), 'vehicle_count')
    density = ctrl.Antecedent(np.arange(0, 101, 1), 'density')
    waiting_time = ctrl.Antecedent(np.arange(0, 61, 1), 'waiting_time')
    priority = ctrl.Consequent(np.arange(0, 101, 1), 'priority')

    # Define membership functions
    # Vehicle count membership functions
    # trimf is a function of fuzz, its full form is traingular membership function and it gives number between range
    vehicle_count['low'] = fuzz.trimf(vehicle_count.universe, [0, 0, 10])
    vehicle_count['medium'] = fuzz.trimf(vehicle_count.universe, [5, 15, 25])
    vehicle_count['high'] = fuzz.trimf(vehicle_count.universe, [20, 30, 30])

    # Density membership functions
    density['low'] = fuzz.trimf(density.universe, [0, 0, 30])
    density['medium'] = fuzz.trimf(density.universe, [20, 50, 80])
    density['high'] = fuzz.trimf(density.universe, [70, 100, 100])
    
    # Waiting time membership functions
    waiting_time['short'] = fuzz.trimf(waiting_time.universe, [0, 0, 20])
    waiting_time['medium'] = fuzz.trimf(waiting_time.universe, [15, 30, 45])
    waiting_time['long'] = fuzz.trimf(waiting_time.universe, [40, 60, 60])
    
    # Priority membership functions
    priority['very_low'] = fuzz.trimf(priority.universe, [0, 0, 20])
    priority['low'] = fuzz.trimf(priority.universe, [10, 30, 50])
    priority['medium'] = fuzz.trimf(priority.universe, [40, 60, 80])
    priority['high'] = fuzz.trimf(priority.universe, [70, 90, 100])
    priority['very_high'] = fuzz.trimf(priority.universe, [90, 100, 100])

    
    # Define fuzzy rules
    rule1 = ctrl.Rule(vehicle_count['high'] & density['high'] & waiting_time['long'], priority['very_high'])
    rule2 = ctrl.Rule(vehicle_count['high'] & density['high'] & waiting_time['medium'], priority['high'])
    rule3 = ctrl.Rule(vehicle_count['high'] & density['medium'] & waiting_time['long'], priority['high'])
    rule4 = ctrl.Rule(vehicle_count['medium'] & density['high'] & waiting_time['long'], priority['high'])
    
    rule5 = ctrl.Rule(vehicle_count['high'] & density['medium'] & waiting_time['medium'], priority['medium'])
    rule6 = ctrl.Rule(vehicle_count['medium'] & density['high'] & waiting_time['medium'], priority['medium'])
    rule7 = ctrl.Rule(vehicle_count['medium'] & density['medium'] & waiting_time['long'], priority['medium'])
    
    rule8 = ctrl.Rule(vehicle_count['low'] & density['low'] & waiting_time['short'], priority['very_low'])
    rule9 = ctrl.Rule(vehicle_count['low'] & density['low'] & waiting_time['medium'], priority['low'])
    rule10 = ctrl.Rule(vehicle_count['low'] & density['medium'] & waiting_time['medium'], priority['low'])
    rule11 = ctrl.Rule(vehicle_count['medium'] & density['low'] & waiting_time['short'], priority['low'])

    # Create and configure the control system
    priority_ctrl = ctrl.ControlSystem([
        rule1, rule2, rule3, rule4, rule5, rule6, rule7, rule8, rule9, rule10, rule11
    ])
    priority_simulator = ctrl.ControlSystemSimulation(priority_ctrl)
    return priority_ctrl, priority_simulator

def calculate_lane_priority_fuzzy(lane_data, simulator, class_weights, class_names):
    """
    Calculate priority score for a lane using fuzzy logic.
    
    Arguments:
    - lane_data: a dictionary with keys 'vehicles', 'density', 'waiting_time'
    - simulator: the fuzzy control system simulator
    - class_weights: dictionary mapping class_id to weight
    - class_names: dictionary mapping class_id to class name string

    Returns:
    - priority score (float)
    """
    def get_weighted_vehicle_count():
        weighted_count = 0
        for class_id, class_name in class_names.items():
            count = lane_data['vehicles'].get(class_name, 0)
            weighted_count += count * class_weights[class_id]
        return weighted_count

    try:
        weighted_vehicle_count = get_weighted_vehicle_count()
        simulator.input['vehicle_count'] = min(30, weighted_vehicle_count)
        simulator.input['density'] = min(100, lane_data['density'])
        simulator.input['waiting_time'] = min(60, lane_data['waiting_time'])

        simulator.compute()
        priority = simulator.output['priority']
    except Exception as e:
        print(f"Fuzzy computation error: {e}")
        priority = (
            get_weighted_vehicle_count() * 2 +
            lane_data['density'] * 0.5 +
            lane_data['waiting_time'] * 0.3
        )
    return priority


def visualize_fuzzy_membership(priority_ctrl, output_dir=None):
    """
    Visualizes the membership functions of all fuzzy variables in the control system.

    Args:
        priority_ctrl: The fuzzy control system (ctrl.ControlSystem)
        output_dir (str): Optional directory path to save images. If None, just shows plots.
    """
    antecedents = [var for var in priority_ctrl.antecedents]
    consequents = [var for var in priority_ctrl.consequents]
    all_vars = antecedents + consequents

    for var in all_vars:
        plt.figure(figsize=(8, 5))
        var.view()
        if output_dir:
            if not os.path.exists(output_dir):
                os.makedirs(output_dir)
            plt.savefig(os.path.join(output_dir, f"fuzzy_{var.label}.jpg"))
        else:
            plt.show()
        plt.close()