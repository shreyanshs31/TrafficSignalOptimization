import numpy as np
import skfuzzy as fuzz
from skfuzzy import control as ctrl

def setup_fuzzy_controller():
    """
    Creates a Fuzzy Logic Control System for Traffic Signal Optimization.
    Inputs: Vehicle Count, Weighted Density, Urgency (Emergency).
    Output: Priority Score (used to calculate green light duration).
    """
    
    # 1. Define Antecedents (Inputs)
    # vehicle_count: Total number of vehicles in the lane (0 to 30)
    vehicle_count = ctrl.Antecedent(np.arange(0, 31, 1), 'vehicle_count')
    
    # density: Weighted occupancy of the lane (0 to 100%)
    density = ctrl.Antecedent(np.arange(0, 101, 1), 'density')
    
    # urgency: Presence of emergency vehicles (Binary but fuzzy, 0 or 100)
    urgency = ctrl.Antecedent(np.arange(0, 101, 1), 'urgency') 
    
    # 2. Define Consequent (Output)
    # priority: A score from 0-100 that determines time added to base signal
    priority = ctrl.Consequent(np.arange(0, 101, 1), 'priority')

    # 3. Membership Functions (Fuzzification)
    # Auto-generate 3 categories (low, medium, high) for standard inputs
    vehicle_count.automf(3, names=['low', 'medium', 'high'])
    density.automf(3, names=['low', 'medium', 'high'])
    
    # Custom membership for Urgency
    urgency['normal'] = fuzz.trimf(urgency.universe, [0, 0, 50])
    urgency['emergency'] = fuzz.trimf(urgency.universe, [60, 100, 100])

    # Custom membership for Priority (Output)
    priority['low'] = fuzz.trimf(priority.universe, [0, 0, 50])
    priority['medium'] = fuzz.trimf(priority.universe, [30, 60, 80])
    priority['high'] = fuzz.trimf(priority.universe, [70, 100, 100])

    # 4. Define Fuzzy Rules (Inference)
    # Rule 1: High vehicle count or high density requires high priority
    rule1 = ctrl.Rule(vehicle_count['high'] | density['high'], priority['high'])
    
    # Rule 2: Medium traffic gets medium priority
    rule2 = ctrl.Rule(vehicle_count['medium'] & density['medium'], priority['medium'])
    
    # Rule 3: Emergency Override (Highest weight)
    rule3 = ctrl.Rule(urgency['emergency'], priority['high']) 
    
    # Rule 4: Low traffic allows for shorter cycles
    rule4 = ctrl.Rule(vehicle_count['low'] & density['low'], priority['low'])

    # 5. Build the Control System
    traffic_ctrl = ctrl.ControlSystem([rule1, rule2, rule3, rule4])
    
    return ctrl.ControlSystemSimulation(traffic_ctrl)