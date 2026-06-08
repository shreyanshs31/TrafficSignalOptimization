from skfuzzy import control as ctrl
import numpy as np
import skfuzzy as fuzz

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
    
    # 2. Define Consequent (Output)
    # priority: A score from 0-100 that determines time added to base signal
    priority = ctrl.Consequent(np.arange(0, 101, 1), 'priority')

    #-------------These two are not in both
    # urgency: Presence of emergency vehicles (Binary but fuzzy, 0 or 100)
    urgency = ctrl.Antecedent(np.arange(0, 101, 1), 'urgency') 

    waiting_time = ctrl.Antecedent(np.arange(0, 121, 1), 'waiting_time')

    #----------------------------

    # Define membership functions
    # Vehicle count membership functions
    # trimf is a function of fuzz, its full form is traingular membership function and it gives number between range
    vehicle_count['low'] = fuzz.trimf(vehicle_count.universe, [0, 0, 15])
    vehicle_count['medium'] = fuzz.trimf(vehicle_count.universe, [10, 20, 30])
    vehicle_count['high'] = fuzz.trimf(vehicle_count.universe, [25, 40, 40])

    # Density membership functions
    density['low'] = fuzz.trimf(density.universe, [0, 0, 40])
    density['medium'] = fuzz.trimf(density.universe, [25, 50, 75])
    density['high'] = fuzz.trimf(density.universe, [60, 100, 100])

    # Priority membership functions
    priority['very_low'] = fuzz.trimf(priority.universe, [0, 0, 20])
    priority['low'] = fuzz.trimf(priority.universe, [10, 30, 50])
    priority['medium'] = fuzz.trimf(priority.universe, [40, 60, 80])
    priority['high'] = fuzz.trimf(priority.universe, [70, 90, 100])
    priority['very_high'] = fuzz.trimf(priority.universe, [90, 100, 100])

    #Urgency membership function 
    urgency['normal'] = fuzz.trimf(urgency.universe, [0, 0, 0.7])
    urgency['emergency'] = fuzz.trimf(urgency.universe, [0.5, 1, 1])

    # Waiting time membership functions
    waiting_time['short'] = fuzz.trimf(waiting_time.universe, [0, 0, 45])
    waiting_time['medium'] = fuzz.trimf(waiting_time.universe, [30, 60, 90])
    waiting_time['long'] = fuzz.trimf(waiting_time.universe, [75, 120, 120])

    #DEFINE FUZZY RULES

    # ---------------------------------------------------------
    # 1. THE EMERGENCY OVERRIDE
    # ---------------------------------------------------------
    # If an ambulance is detected, nothing else matters.
    rule1 = ctrl.Rule(urgency['emergency'], priority['very_high'])

    # ---------------------------------------------------------
    # 2. STARVATION PREVENTION (Long Wait Times)
    # ---------------------------------------------------------
    # If they have waited a long time and traffic is heavy, force a green light.
    rule2 = ctrl.Rule(urgency['normal'] & waiting_time['long'] & density['high'], priority['very_high'])

    # If they have waited long, but it's only moderate traffic.
    rule3 = ctrl.Rule(urgency['normal'] & waiting_time['long'] & vehicle_count['medium'], priority['high'])

    # If a single car has been sitting at a red light forever.
    rule4 = ctrl.Rule(urgency['normal'] & waiting_time['long'] & vehicle_count['low'], priority['medium'])

    # ---------------------------------------------------------
    # 3. HEAVY TRAFFIC MANAGEMENT
    # ---------------------------------------------------------
    # High volume that has been waiting a normal amount of time.
    rule5 = ctrl.Rule(urgency['normal'] & waiting_time['medium'] & vehicle_count['high'], priority['high'])

    # High volume that just arrived (don't give them green instantly if others are waiting).
    rule6 = ctrl.Rule(urgency['normal'] & waiting_time['short'] & density['high'], priority['medium'])

    # ---------------------------------------------------------
    # 4. MODERATE & LOW TRAFFIC 
    # ---------------------------------------------------------
    # Standard flow for moderate traffic.
    rule7 = ctrl.Rule(urgency['normal'] & waiting_time['medium'] & vehicle_count['medium'], priority['medium'])

    # A few cars that have been waiting a bit.
    rule8 = ctrl.Rule(urgency['normal'] & waiting_time['medium'] & density['low'], priority['low'])

    # Empty lane or very few cars that just arrived.
    rule9 = ctrl.Rule(urgency['normal'] & waiting_time['short'] & vehicle_count['low'], priority['very_low'])

    # 5. Build the Control System
    traffic_ctrl = ctrl.ControlSystem([rule1, rule2, rule3, rule4, rule5, rule6, rule7, rule8, rule9])

    return ctrl.ControlSystemSimulation(traffic_ctrl)

def validate_and_compute(simulator, inputs):
    """
    Safely compute the fuzzy logic output with validation.
    
    Args:
        simulator: ControlSystemSimulation instance
        inputs: Dict with 'vehicle_count', 'density', 'urgency', 'waiting_time'
    
    Returns:
        Dict with 'priority' output, or None if computation fails
    """
    try:
        # Set inputs with defaults
        simulator.input['vehicle_count'] = inputs.get('vehicle_count', 0)
        simulator.input['density'] = inputs.get('density', 0)
        simulator.input['urgency'] = inputs.get('urgency', 0)
        simulator.input['waiting_time'] = inputs.get('waiting_time', 0)
        
        # Compute the output
        simulator.compute()
        
        # Validate output
        if 'priority' not in simulator.output:
            return None
        
        return {'priority': simulator.output['priority']}
    except Exception as e:
        print(f"❌ Fuzzy Logic Computation Error: {e}")
        return None