import { useEffect, useState } from "react"; // useEffect is for dealing with side effects (like fetching data), and useState is for managing state in a functional component.
import { supabaseClient } from "./supabaseClient"; // Import the Supabase client instance that we created in the supabaseClient.ts file.
import { Task } from "./taskFields"; // Import the Task type that was defined in the taskField.ts file (contains the fields for a task).
import { DragDropContext, DropResult } from "@hello-pangea/dnd"; // For drag-and-drop functionality, including the context and the type for the result of a drop action.
import Column from "./components/Column"; // Represents a column (todo, in-progress, in-review, done).
import AddTask from "./components/AddTask"; // Component for adding a new task to the board (input field and submit button).

function App() {
  const [user, setUser] = useState<any>(null); // State variable to hold the authenticated user information, initialized to null.
  const [tasks, setTasks] = useState<Task[]>([]); // State variable (for tasks) to hold the list of tasks (with the fields defined in taskField.ts), initialized to an empty array.

  const fetchTasks = async (currentUser: any) => {
    if (!currentUser) return; // If there is no authenticated user, exit the function early (no tasks to fetch).

    const { data, error } = await supabaseClient
      .from("tasks")
      .select("*")
      .eq("user_id", currentUser.id) // Filter tasks to only include those that belong to the authenticated user (using the user_id field).
      .order("created_at", { ascending: true }); // Oldest tasks first.

    if (error) {
      console.error("Error fetching:", error);
    } else {
      setTasks(data || []); // If data is returned, set the tasks state to the fetched data. Otherwise, set it as empty.
    }
  };

  useEffect(() => {
    const setupAuth = async () => {
      // Verify if the user is already logged in (authenticated) when the app loads.
      const {
        data: { session },
      } = await supabaseClient.auth.getSession(); // Get the current authentication session from Supabase.

      if (
        session
      ) // For if the user has already authenticated before (already visited at least once).
      {
        setUser(session.user); // If there is a session, set the user state to the authenticated user's information (guest user in this case).
      } else // For if this is the user's first time visiting the app.
      {
        // If there is no session, sign in the user anonymously (as a guest).
        const { data, error } = await supabaseClient.auth.signInAnonymously(); // Sign in the user anonymously using Supabase's authentication method.

        if (data.user) {
          setUser(data.user); // If the anonymous sign-in is successful, set the user state to the NEWLY authenticated user's information (again, guest user in this case).
        }
        if (error) {
          console.error("Error signing in anonymously:", error); // Log error if anonymous sign-in failed.
        }
      }
    };

    setupAuth(); // Call function to set up authentication when the component mounts (when the app loads).
  }, []); // Empty dependency array means this effect runs only when the component mounts (when the app loads).

  useEffect(() => {
    if (user) {
      fetchTasks(user); // After signing in anonymously, fetch the tasks for this new user (likely empty since it is a new user).
    }
  }, [user]); // This effect runs whenever the user state changes (after authentication is set up).

  console.log("Current User State:", user); // Add this right before the 'if (!user)' check.

  const onDragEnd = async (result: DropResult) => {
    const { destination, source, draggableId } = result; // destination: where task was dropped. source: where task came from. draggableId: task's ID.

    // If dropped outside a list or in the same spot, do nothing:
    if (
      !destination ||
      (destination.droppableId === source.droppableId &&
        destination.index === source.index)
    ) {
      return;
    }

    // 1. Update local state immediately (Optimistic UI):
    const updatedTasks = tasks.map(
      (
        t, // Update status of dragged task to its new status (destination.droppableId) in the local state (code) immediately, before confirming with Supabase. This makes the UI feel more responsive.
      ) =>
        t.id === draggableId
          ? { ...t, status: destination.droppableId as any }
          : t,
    );
    setTasks(updatedTasks);

    // 2. Update Supabase:
    const { error } = await supabaseClient
      .from("tasks")
      .update({ status: destination.droppableId }) // Update the status of the task in the DATABASE to match its new status (destination.droppableId).
      .eq("id", draggableId);

    if (error) {
      console.error("Error updating status:", error);
      fetchTasks(user); // Revert on error
    }
  };

  if (!user) {
    return <div>Loading...</div>; // If the user state is still null (authentication is still setting up), show a loading message.
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      {/* Title */}
      <header className="max-w-6xl mx-auto mb-8">
        <h1 className="text-3xl font-bold mb-8 text-gray-900">Task Board</h1>
        <p className="text-gray-500">Your tasks:</p>
      </header>

      {/* The Task Input/Creation bar */}
      <main className="max-w-6xl mx-auto">
        <div className="max-w-xs mb-8">
          <AddTask userId={user.id} onTaskAdded={() => fetchTasks(user)} />
          {/* Pass the authenticated user's ID and a callback to refresh the task list after adding a new task. */}
        </div>

        {/* The four columns (todo, in-progress, in-review, done) */}
        <DragDropContext onDragEnd={onDragEnd}>
          <div className="flex gap-6 overflow-x-auto pb-4">
            <Column
              title="To Do"
              status="todo"
              tasks={tasks.filter((t) => t.status === "todo")}
              onTaskUpdate={() => fetchTasks(user)} // Pass a callback to refresh the task list after updating a task (after adding, deleting, or drag-and-drop).
            />
            <Column
              title="In Progress"
              status="in_progress"
              tasks={tasks.filter((t) => t.status === "in_progress")}
              onTaskUpdate={() => fetchTasks(user)} // Pass a callback to refresh the task list after updating a task (after adding, deleting, or drag-and-drop).
            />
            <Column
              title="In Review"
              status="in_review"
              tasks={tasks.filter((t) => t.status === "in_review")}
              onTaskUpdate={() => fetchTasks(user)} // Pass a callback to refresh the task list after updating a task (after adding, deleting, or drag-and-drop).
            />
            <Column
              title="Done"
              status="done"
              tasks={tasks.filter((t) => t.status === "done")}
              onTaskUpdate={() => fetchTasks(user)} // Pass a callback to refresh the task list after updating a task (after adding, deleting, or drag-and-drop).
            />
          </div>
        </DragDropContext>
      </main>
    </div>
  );
}
export default App; // Export the App component as the default export of this module, so it can be imported and used in other parts of the app (like index.tsx).
