/**                                                                                                                  *
 *  _______________________________________________________________________________________________________________  *
 *                                                                                                                   *
 *    AVTOMAT - Non-deterministic Finite State Machine (with Empty Moves) Implementation                             *
 *  _______________________________________________________________________________________________________________  *
 *                                                                                                                   *
 *    Version: 1.1                                                                                                   *
 *    Author:  Temoto-kun                                                                                            *
 *    Date:    2013 December 13   08:50 [UTC+8]                                                                      *
 *                                                                                                                   *
 *  =============================================================================================================== **/

(function(w) {
	w.Avtomat = w.Avtomat || {
		/**
		 * A non-deterministic finite state machine which supports empty moves for transitions.
		 * @param states JSON object containing the states, and their details (is final state, transitions).
		 * @param startState The ID of the start state
		 * @constructor
		 */
		StateMachine : function(states, startState) {



			/* =============== *
			 * Private Members *
			 * =============== */

			/* ------ *
			 * Fields *
			 * ------ */

 			var
				// The states
				_states = [],

				// The ID for the "null" state
				_nullStateId = null,

				// The string for the empty input
				_emptyInput = "",

				// IDs of the current state
				_cState = [_nullStateId],

				// ID of the start state
				_startStateId = startState || _nullStateId,

		        // events triggered...
			    _events = {
				    // ... during state change
					changing: [],
				    // after state change
					change: []
				}
				;

			/* ------- *
			 * Methods *
			 * ------- */

 			/**
			 * Adds a transition from one state to another.
			 * @param idFrom The ID of the source state
			 * @param input The input symbol
			 * @param idTo The ID of the destination state
			 * @private
			 */
			function _addTransition(idFrom, input, idTo) {
				_states[idFrom].transitions[input] = idTo;
			}

			function _deleteTransition(id, input) {
				// FIXME dunno what this does
				// delete _states[idFrom].transitions[input];
				_states[idFrom].transitions[input] = undefined;
			}

			/**
			 * Adds a new state.
			 * @param id The ID of the new state
			 * @param isFinal Is state a final state?
			 * @param transitions Associative array containing the input symbol, and the destination state id
			 * @see _createBlankState
			 * @see _addTransition
			 * @private
			 */
			function _addState(id, isFinal, transitions) {
				if(_states[id] === undefined) {
					if(_startStateId == _nullStateId)
						// make the first non-null state to be startState, given that there
						_setStartState(id);

					_states[id] = _createBlankState();

					if(id != _nullStateId) {
						_setFinal(id, isFinal);
						if(transitions !== undefined)
							for(var input in transitions)
								_addTransition(id, input, transitions[input]);
					}
				}
			}

			function _deleteState(id) {
				// FIXME dunno what this does
				// delete _states[id];
				_states[id] = undefined;
			}

			/**
			 * Creates a prefab blank state.
			 * @returns {{final: boolean, transitions: Array}} New blank non-final state with no transitions
			 * @private
			 */
			function _createBlankState() {
				return {
					final: false,
					transitions: [],
					events: {
						arriving: [],
						arrive: [],
						leaving: [],
						leave: []
					}
				};
			}

			/**
			 * Sets a state to be final state.
			 * @param id The ID of the state
			 * @param bFinal Is state a final state?
			 * @private
			 */
			function _setFinal(id, bFinal) {
				if(id != _nullStateId)
					_states[id].final = bFinal;
			}

			/**
			 * Resets the machine.
			 * @returns {Array} The current state
			 * @private
			 */
			function _reset() {
				_cState = [_startStateId];
				_input("");
				return _cState;
			}

			/**
			 * Inputs a symbol to the machine.
			 * @param input The input symbol
			 * @returns {Array} The resulting state
			 * @private
			 */
			function _input(input) {
				var
					// Queue for old states
					srcStates = _cState,

					// Stack for new states
					newStates = [],

					// If the new states have empty moves
					haveEmptyMoves = false,

					events;

				// Trigger machine state changing
				events = _events.changing;

				// Trigger leaving events
				for(var e in events)
					events[e]();

				/*
				 * _input operates with a queue as container for the state IDs for processing. It empties srcStates to
				 * make sure all the states will receive the input.
				 */
				while(srcStates.length > 0) {
					// Dequeue
					var oldState = srcStates.shift();

					events = _states[oldState].events.leaving;

					// Trigger leaving events
					for(e in events)
						events[e]();

					// Destination states (non-array), i.e. state ID strings by themselves
					var destStateObjs = _states[oldState].transitions[input]
						// if there is no explicity-defined destination states for empty moves, current state is
						// retained
						|| (input == _emptyInput ? oldState : _nullStateId);
					// Destination states (array)
					var destStates;

					// Destination states must be turned into an array for processing
					if(destStateObjs instanceof Array)
						destStates = destStateObjs;
					else
						destStates = [destStateObjs];

					// Determine the destination states
					for(var j = 0; j < destStates.length; j++) {
						var containsState = false;
						for(var k = 0, cStateLen = newStates.length; k < cStateLen; k++)
							containsState = (containsState || (newStates[k] == destStates[j]));
						if(!containsState && destStates[j] != _nullStateId) {
							// Make sure the destination states don't duplicate. Null states are not included as well.

							// Trigger leave events
							events = _states[oldState].events.leave;
							for(e in events)
								events[e]();

							// Trigger arriving events
							events = _states[destStates[j]].events.arriving;
							for(e in events)
								events[e]();

							newStates.push(destStates[j]);

							// Trigger arrive events
							events = _states[destStates[j]].events.arrive;
							for(e in events)
								events[e]();
						}
					}

					// Terminate the state transitions when there are no explicitly-defined empty transitions
					if(input == _emptyInput && destStateObjs == _nullStateId)
						haveEmptyMoves = false;
				}
				_cState = newStates;

				// Trigger machine state changing
				events = _events.change;

				// Trigger leaving events
				for(e in events)
					events[e]();

				// can't have empty moves when machine doesn't have current states
				if(newStates.length > 0) {
					for(var l in newStates) {
						if(_states[newStates[l]].transitions[_emptyInput] !== undefined) {
							haveEmptyMoves = true;
							break;
						}
					}
					if(haveEmptyMoves)
						_input(_emptyInput)
				}
				return _cState;
			}

			/**
			 * Sets the start state.
			 * @param id The ID of an existing state
			 * @private
			 */
			function _setStartState(id) {
				_startStateId = id;
			}

			/**
			 * Gets the current state(s).
			 * @returns {Array} The IDs of the current state(s)
			 * @private
			 */
			function _getCurrentStates() {
				return _cState;
			}

			/**
			 * Determines if the current state is a final state.
			 * @returns {boolean} Is current state a final state?
			 * @private
			 */
			function _isAccepted() {
				for(var i in _cState)
					if(_states[_cState[i]]["final"])
						return true;
				return false;
			}

			function _bindStateEvent(stateId, type, fn) {
				_states[stateId].events[type].push(fn);
			}

			function _bindMachineEvent(type, fn) {
				_events[type].push(fn);
			}

			/*
			function _hasTransitions(id) {
				if(id == undefined)
					id = _getCurrentStates();
				else if(!(id instanceof Array))
					id = [id];

				var b = false;
				for(var state in id) {
					var t = 0;
					for(var transitions in _states[id].transitions)
						t++;
					b = b || t > 0;
				}
				return b;
			}
			*/

			function _hasTransition(id, input) {
				return _states[id].transitions[input] !== undefined || input == _emptyInput;
			}

			function _hasTransitions(id) {
				for(var transitions in _states[id].transitions)
					return true;
				return false;
			}



			/* =========== *
			 * Constructor *
			 * =========== */

			(function(states, startState) {
				// add the default null state
				_addState(_nullStateId, false, []);

				if(states !== undefined)
					for(var stateName in states)
						_addState(stateName, states[stateName]["final"], states[stateName].transitions);

				// Make the explicity-declared start state be startState
				if(startState !== undefined)
					_setStartState(startState);

				// Run the machine
				_reset();
			})(states, startState);



			/* ================== *
			 * Privileged Members *
			 * ================== */

			return {
				/**
				 * Resets the machine.
				 * @returns {Array} The current state
				 */
				reset: _reset,

				/**
				 * Inputs a symbol to the machine.
				 * @param i The input symbol
				 * @returns {Array} The resulting state
				 */
				input: _input,

				/**
				 * Gets the current state(s).
				 * @returns {Array} The IDs of the current state(s)
				 */
				state: _getCurrentStates,

				/**
				 * Determines if the current state is a final state.
				 * @returns {boolean} Is current state a final state?
				 */
				accepted: _isAccepted,
				
				nullState: function() {
					return _getCurrentStates().length == 0;
				},

				addState: _addState,

				deleteState: _deleteState,

				addTransition: _addTransition,

				deleteTransition: _deleteTransition,

				hasTransition: _hasTransition,

				hasTransitions: function(id) {
					if(id == undefined)
						id = _getCurrentStates();
					else if(id instanceof Array) {
						var b = false;
						for(var state in id)
							b = b || _hasTransitions[state];
						return b;
					}
					return typeof(id) == "string" && _hasTransitions(id);
				},

				bindStateEvent: _bindStateEvent,

				bindMachineEvent: _bindMachineEvent
			};
		}
	};
})(window);
