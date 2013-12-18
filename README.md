# AVTOMAT
Non-deterministic Finite State Machine (with Empty Moves) Implementation

## Usage
Add `<script type="text/javascript" src="path/to/scripts/avtomat-1.0.js">` in
your HTML `<head>` or `<body>`.

## Reference
* `.state()` - gets the current state
* `.input(symbol)` - inputs a symbol to the state machine
* `.reset()` - resets the machine
* `.accepted()` - determines if at least one of the current states are final

## Initialization
The syntax of the constructor is:

    Avtomat.StateMachine(states, startState)

where:
* `states` is the JSON object containing the details of the machine's states (see below)
* `startState` is the ID of the state acting as a start state of the machine

The `states` object has this following structure:

    {
        stateID: {
            "final": <boolean>,
            "transitions": {
                inputSymbol: stateID,
                inputSymbol: stateID,
                .
                .
                .
                inputSymbol: stateID,
            }
        },
        stateID: {
            .
            .
            .
        },
        .
        .
        .
    }
    
where:
* `stateID` is a string which acts as identifier for a state
* `<boolean>` is a Boolean value of `true` or `false`
* `inputSymbol` is a string or a number (probably objects as well)

To initialize an instance of the state machine object:

	var foo = new Avtomat.StateMachine({
		"stateName": {
			"final": false // boolean
			"transitions": {
				// stateSymbol could be integer, float, or string
				"stateSymbol": "anotherStateName",
				"stateSymbol2": ["stateName1", "stateName2"],
				...
				"": "stateName3" // for the empty moves, put an empty string
			}
		}
	}, "stateName2"); // stateName2 is the start state

## Example

	var automaton = new Avtomat.StateMachine({
		"A": {
			"final": false, "transitions": {
				"b": "B",
				"c": ["C", "D"],
				"d": "A",
				"": "E"
			}
		},
		"B": {
			"final": false, "transitions": {
				"a": "A",
				"c": "C",
				"d": "E"
			}
		},
		"C": {
			"final": false,
			"transitions": {
				"": "A"
			}
		},
		"D": {
			"final": true,
			"transitions": {
				"a": "D",
				"b": "E",
				"c": ["B", "D"],
				"d": "D",
				"e": "E"
			}
		},
		"E": {
			"final": false,
			"transitions": {
				"d": "D",
				"c": "C",
			}
		}
	}, "A");

	automaton.state(); // ["E"]: A("") => E
	automaton.input("d"); // ["D"]: E("d") => D
	automaton.accepted(); // true: D is final state
	automaton.input("B"); // []: No such transition, goes to null state
	automaton.input("a"); // []: Null states have no transitions
	automaton.nullState(); // true
	automaton.reset(); // ["E"]: Reset to original state A, A("") => E
	automaton.input("d"); // ["D"]: E("d") => D
	automaton.input("c"); // ["B", "D"]: D("c") => {B, D}
	automaton.input("d"); // ["D", "E"]: B("d") => E, D("d") => D
	automaton.accepted(); // true: D is final state
	automaton.input("e"); // ["E"]: D("e") => E, E("e") => null
	automaton.accepted(); // false: E is not a final state
	automaton.reset(); // ["E"]: Reset to original state A, A("") => E
	automaton.input("c"); // ["E"]: E("c") => C, C("") => A, A("") => E
 