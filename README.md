# AVTOMAT
Non-deterministic Finite State Machine (with Empty Moves) Implementation

## Installation

Bower:

	$ bower install --save avtomat

NPM:

	$ npm install --save avtomat

## Usage

The syntax of the constructor is:

```javascript
    Avtomat.StateMachine(states, startState)
```

where:

* `states` is the JSON object containing the details of the machine's states (see below)
* `startState` is the ID of the state acting as a start state of the machine

The `states` object has this following structure:

```javascript
    {
        stateID: {
            final: stateFinal,
            transitions: {
                inputSymbol: stateID,
                inputSymbol: stateID,
                // more transitions...
                inputSymbol: stateID,
            }
        },
        stateID: {
        	// ...
        },
        // more states...
    }
```

where:

* `stateID` is a string which acts as identifier for a state
* `stateFinal` is a Boolean value
* `inputSymbol` is any object

To initialize an instance of the state machine object:

```javascript
	var foo = new Avtomat.StateMachine({
		"stateName": {
			final: false // boolean
			transitions: {
				// stateSymbol could be integer, float, or string
				stateSymbol: "anotherStateName",
				stateSymbol2: ["stateName1", "stateName2"],
				//...
				"": "stateName3" // for the empty (epsilon) moves, put a zero-length string for input
			}
		}
	}, "stateName"); // stateName is the start state
```

## API

| Method                                     | Description                                                        |
|--------------------------------------------|--------------------------------------------------------------------|
| `state()`                                  | Gets the current state(s).                                         |
| `input(symbol)`                            | Inputs a symbol to the machine.                                    |
| `reset()`                                  | Resets the machine.                                                |
| `accepted()`                               | Determines if at least one of the current states is a final state. |
| `nullState()`                              | Determines if the list of current states is empty.                 |
| `addState(id, isFinal, transitions)`       | Adds a state to the machine.                                       |
| `deleteState(id)`                          | Deletes a state from the machine.                                  |
| `addTransition(idFrom, inputSymbol, idTo)` | Adds a transition from one state to another.                       |
| `deleteTransition(idFrom, inputSymbol)`    | Deletes a transition from one state to another.                    |
| `hasTransition(stateId, inputSymbol)`      | Determines if the machine has a state with a corresponding input.  |
| `hasTransitions(stateId)`                  | Determines if a state has transitions.                             |

### Event related

Bind state events with `bindStateEvent(stateId, type, fn)`. `type` should be one of the following:

* `"arriving"` - when state is becoming a current state
* `"arrive"` - when state is a current state
* `"leaving"` - when state is losing its current state status
* `"leave"` - when state is no longer a current state

Bind machine events with `bindMachineEvent(type, fn)`. `type` should be one of the following:

* `"changing"` - when machine is changing state
* `"change"` - when machine has changed state

State-bound events take higher priority than machine-bound events.

## Example

```javascript
	var automaton = new Avtomat.StateMachine({
		"A": {
			final: false, transitions: {
				"b": "B",
				"c": ["C", "D"],
				"d": "A",
				"": "E"
			}
		},
		"B": {
			final: false, transitions: {
				"a": "A",
				"c": "C",
				"d": "E"
			}
		},
		"C": {
			final: false,
			transitions: {
				"": "A"
			}
		},
		"D": {
			final: true,
			transitions: {
				"a": "D",
				"b": "E",
				"c": ["B", "D"],
				"d": "D",
				"e": "E"
			}
		},
		"E": {
			final: false,
			transitions: {
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
```
