/**                                                                                                                  *
 *  _______________________________________________________________________________________________________________  *
 *                                                                                                                   *
 *    AVTOMAT - Non-deterministic Finite State Machine (with Empty Moves) Implementation                             *
 *  _______________________________________________________________________________________________________________  *
 *                                                                                                                   *
 *    Author: Temoto-kun                                                                                             *
 *    Date:   2013 December 13   08:50 [UTC+8]                                                                       *
 *                                                                                                                   *
 *  =============================================================================================================== **/

(function(w) {
	w.Avtomat = w.Avtomat || {
		/**
		 * A non-deterministic finite state machine which supports empty moves for transitions.
		 * @param states JSON object containing the states, and their details (is final state, transitions).
		 * @param startState The ID of the start state
		 * @returns {Avtomat.StateMachine} New instance of the Avtomat.StateMachine
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
				_startStateId = startState || _nullStateId
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
						for(var input in transitions) {
							//noinspection JSUnfilteredForInLoop
							_addTransition(id, input, transitions[input]);
						}
					}
				}
			}

			/**
			 * Creates a prefab blank state.
			 * @returns {{final: boolean, transitions: Array}} New blank non-final state with no transitions
			 * @private
			 */
			function _createBlankState() {
				return { final: false, transitions: [] };
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
					haveEmptyMoves = false;

				/*
				 * _input operates with a queue as container for the state IDs for processing. It empties srcStates to
				 * make sure all the states will receive the input.
				 */
				while(srcStates.length > 0) {
					// Dequeue
					var oldState = srcStates.shift();

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
						if(!containsState && destStates[j] != _nullStateId)
							// Make sure the destination states don't duplicate. Null states are not included as well.
							newStates.push(destStates[j]);
					}

					// Terminate the state transitions when there are no explicitly-defined empty transitions
					if(input == _emptyInput && destStateObjs == _nullStateId)
						haveEmptyMoves = false;
				}
				_cState = newStates;

				// can't have empty moves when machine doesn't have current states
				if(newStates.length > 0) {
					for(var l in newStates) { //noinspection JSUnfilteredForInLoop
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
				for(var i in _cState) {
					//noinspection JSUnfilteredForInLoop
					if(_states[_cState[i]].final)
						return true;
				}
				return false;
			}



			/* =========== *
			 * Constructor *
			 * =========== */

			(function(states, startState) {
				// add the default null state
				_addState(_nullStateId, false, []);

				if(states !== undefined)
					for(var stateName in states) { //noinspection JSUnfilteredForInLoop
						_addState(stateName, states[stateName].final, states[stateName].transitions);
					}

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
				reset: function() {
					return _reset();
				},

				/**
				 * Inputs a symbol to the machine.
				 * @param i The input symbol
				 * @returns {Array} The resulting state
				 */
				input: function(i) {
					return _input(i);
				},

				/**
				 * Gets the current state(s).
				 * @returns {Array} The IDs of the current state(s)
				 */
				state: function() {
					return _getCurrentStates();
				},

				/**
				 * Determines if the current state is a final state.
				 * @returns {boolean} Is current state a final state?
				 */
				accepted: function() {
					return _isAccepted();
				},
				
				nullState: function() {
					return _getCurrentStates().length == 0;
				}
			};
		}
	};
})(window);
