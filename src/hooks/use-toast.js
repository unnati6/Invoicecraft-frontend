

import * as React from "react";
const TOAST_LIMIT = 1;
const TOAST_REMOVE_DELAY = 3000; // This is a very long delay (1 million ms = 1000 seconds = ~16.6 minutes)
const ToasterToast = {
  id: '',
  title: undefined, // React.ReactNode
  description: undefined, // React.ReactNode
  action: undefined, // ToastActionElement

  // Other properties from your Toast component's props (e.g., variant, duration)
};

const actionTypes = {
  ADD_TOAST: "ADD_TOAST",
  UPDATE_TOAST: "UPDATE_TOAST",
  DISMISS_TOAST: "DISMISS_TOAST",
  REMOVE_TOAST: "REMOVE_TOAST",
};

let count = 0;

function genId() {
  count = (count + 1) % Number.MAX_SAFE_INTEGER;
  return count.toString();
}

// Represents the state shape
// interface State { toasts: ToasterToast[] }
// We'll define the initial state directly.
const initialState = {
  toasts: [],
};

const toastTimeouts = new Map(); // Map<string, ReturnType<typeof setTimeout>>

const addToRemoveQueue = (toastId) => {
  if (toastTimeouts.has(toastId)) {
    return;
  }

  const timeout = setTimeout(() => {
    toastTimeouts.delete(toastId);
    dispatch({
      type: "REMOVE_TOAST",
      toastId: toastId,
    });
  }, TOAST_REMOVE_DELAY); // Using the large delay here

  toastTimeouts.set(toastId, timeout);
};

export const reducer = (state, action) => {
  switch (action.type) {
    case actionTypes.ADD_TOAST: // Use actionTypes.ADD_TOAST instead of "ADD_TOAST" for consistency
      return {
        ...state,
        toasts: [action.toast, ...state.toasts].slice(0, TOAST_LIMIT),
      };

    case actionTypes.UPDATE_TOAST:
      return {
        ...state,
        toasts: state.toasts.map((t) =>
          t.id === action.toast.id ? { ...t, ...action.toast } : t
        ),
      };

    case actionTypes.DISMISS_TOAST: {
      const { toastId } = action;

      // ! Side effects ! - This could be extracted into a dismissToast() action,
      // but I'll keep it here for simplicity
      if (toastId) {
        addToRemoveQueue(toastId);
      } else {
        state.toasts.forEach((toast) => {
          addToRemoveQueue(toast.id);
        });
      }

      return {
        ...state,
        toasts: state.toasts.map((t) =>
          t.id === toastId || toastId === undefined
            ? {
                ...t,
                open: false, // Mark toast as closed
              }
            : t
        ),
      };
    }
    case actionTypes.REMOVE_TOAST:
      if (action.toastId === undefined) {
        return {
          ...state,
          toasts: [], // Remove all toasts
        };
      }
      return {
        ...state,
        toasts: state.toasts.filter((t) => t.id !== action.toastId),
      };
    default:
      return state; // Always return state for unknown actions
  }
};

const listeners = []; // Array<(state: State) => void>

let memoryState = { toasts: [] }; // Initial memory state

function dispatch(action) {
  memoryState = reducer(memoryState, action);
  listeners.forEach((listener) => {
    listener(memoryState);
  });
}

// Omit<ToasterToast, "id"> - in JS, we just take all props except 'id'
function toast({ ...props }) {
  const id = genId();

  const update = (props) =>
    dispatch({
      type: actionTypes.UPDATE_TOAST, // Use actionTypes.UPDATE_TOAST
      toast: { ...props, id },
    });
  const dismiss = () => dispatch({ type: actionTypes.DISMISS_TOAST, toastId: id }); // Use actionTypes.DISMISS_TOAST

  dispatch({
    type: actionTypes.ADD_TOAST, // Use actionTypes.ADD_TOAST
    toast: {
      ...props,
      id,
      open: true, // Mark toast as open
      onOpenChange: (open) => {
        // This is crucial for controlling the Radix UI dialog.
        // If the toast is closed by user interaction (e.g., clicking close button or timeout),
        // Radix will call onOpenChange(false), triggering dismiss().
        if (!open) dismiss();
      },
    },
  });

  return {
    id: id,
    dismiss,
    update,
  };
}

function useToast() {
  const [state, setState] = React.useState(memoryState);

  React.useEffect(() => {
    // Add the setState function to the listeners array
    listeners.push(setState);

    // Return a cleanup function
    return () => {
      // Remove the setState function from the listeners array when the component unmounts
      const index = listeners.indexOf(setState);
      if (index > -1) {
        listeners.splice(index, 1);
      }
    };
    // The dependency array should be empty because we only want to set up
    // and tear down the listener once per component mount.
    // If 'state' was in the dependency array, it would re-run the effect
    // every time state changes, leading to listeners being added multiple times.
  }, []); // Empty dependency array

  return {
    ...state,
    toast, // The function to trigger a toast
    dismiss: (toastId) => dispatch({ type: actionTypes.DISMISS_TOAST, toastId }), // Use actionTypes.DISMISS_TOAST
  };
}

export { useToast, toast };