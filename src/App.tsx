import { useEffect, useState } from "react"; // useEffect is for dealing with side effects (like fetching data), and useState is for managing state in a functional component.
import { supabaseClient } from "./supabaseClient"; // Import the Supabase client instance that we created in the supabaseClient.ts file.
import { Task } from "./taskFields"; // Import the Task type that was defined in the taskField.ts file (contains the fields for a task).
import { DragDropContext, DropResult } from "@hello-pangea/dnd"; // For drag-and-drop functionality, including the context and the type for the result of a drop action.
import Column from "./components/Column"; // Represents a column (todo, in-progress, in-review, done).
import AddTask from "./components/AddTask"; // Component for adding a new task to the board (input field and submit button).

function App() {
  const [user, setUser] = useState<any>(null); // State variable to hold the authenticated user information, initialized to null.
  const [tasks, setTasks] = useState<Task[]>([]); // State variable (for tasks) to hold the list of tasks (with the fields defined in taskField.ts), initialized to an empty array.
  const [searchQuery, setSearchQuery] = useState(""); // State variable for the search query input by the user, initialized to an empty string. This filters out the displayed tasks based on the search query.
  const [priorityFiltering, setPriorityFiltering] = useState("all"); // State variable for the priority filter, initialized to "all". This filters out the displayed tasks based on their priority level (low, normal, high).

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

  const filteredTasks = tasks.filter((task) => {
    const searchMatched = task.title
      .toLowerCase()
      .includes(searchQuery.toLowerCase()); // Filter tasks based on the search query (not case-sensitive).
    const priorityMatched =
      priorityFiltering === "all" || task.priority === priorityFiltering; // Filter tasks based on the priority filter (if "all" is selected, all tasks match; otherwise, only tasks with the selected priority will match).

    return searchMatched && priorityMatched; // A task must match both the search query AND priority filter to be added to the filteredTasks array that the UI will display.
  });

  // Variable to hold the current numbers of total, completed, and overdue tasks, which will be displayed in the UI (takes into account of filtering).
  const currentStats = {
    total: filteredTasks.length, // Total number of tasks (length of the Task[] array from the tasks state).
    completed: filteredTasks.filter((t) => t.status === "done").length, // Number of completed tasks (tasks with status "done", AKA the ones in the "Done" column).
    overdue: filteredTasks.filter((t) => {
      if (!t.due_date || t.status === "done") {
        return false; // If there is no due date for the task or the task is already completed (has status "done"), then it cannot be overdue.
      }

      // Logic to determine if the current date and time is past the task's due date and time:
      const [year, month, day] = t.due_date.split("-").map(Number); // Split the due date string (in "YYYY-MM-DD" format) into year, month, and day components and convert them to numbers.
      return (
        new Date(year, month - 1, day).getTime() <
        new Date().setHours(0, 0, 0, 0)
      ); // Create a Date object for the task's due date (adjusting month since JavaScript months are 0-indexed) and compare it to the current date (set to midnight).
    }).length,
  };

  if (!user) {
    return <div>Loading...</div>; // If the user state is still null (authentication is still setting up), show a loading message.
  }

  return (
    <div className="min-h-screen bg-white p-8">
      {/* Title */}
      <header className="max-w-6xl mx-auto mb-8">
        <div className="flex justify-between items-end mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-8 text-gray-900">
              Task Board
            </h1>
            <p className="text-gray-500 text-sm">
              Welcome back, {user?.email?.split("@")[0] || "Guest"}!
            </p>
          </div>

          {/* Task Statistics (Total, Completed, Overdue) */}
          <div className="flex gap-4">
            <div className="bg-white border border-gray-200 px-4 py-2 rounded-lg shadow-sm">
              <p className="text-[10px] uppercase tracking-wider text-gray-400 font-bold">
                Total
              </p>
              <p className="text-xl font-semibold text-gray-700">
                {currentStats.total}
              </p>
            </div>
            <div className="bg-white border border-gray-200 px-4 py-2 rounded-lg shadow-sm">
              <p className="text-[10px] uppercase tracking-wider text-gray-400 font-bold">
                Done
              </p>
              <p className="text-xl font-semibold text-green-600">
                {currentStats.completed}
              </p>
            </div>
            <div className="bg-white border border-gray-200 px-4 py-2 rounded-lg shadow-sm">
              <p className="text-[10px] uppercase tracking-wider text-gray-400 font-bold">
                Overdue
              </p>
              <p className="text-xl font-semibold text-red-600">
                {currentStats.overdue}
              </p>
            </div>
          </div>
        </div>
      </header>

      {/* The Task Input/Creation bar */}
      <main className="max-w-6xl mx-auto">
        <div className="max-w-6xl mx-auto mb-6 flex justify-between items-center">
          <div className="flex gap-2 items-center">
            <div className="relative w-72">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400">
                🔍
              </span>
              {/* Search input field for filtering tasks by title: */}
              <input
                type="text"
                placeholder="Search tasks..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all shadow-sm"
              />
            </div>

            {/* Dropdown select for filtering tasks based on priority: */}
            <select
              value={priorityFiltering}
              onChange={(e) => setPriorityFiltering(e.target.value)}
              className="bg-white border border-gray-200 rounded-lg px-3 text-xs font-medium text-gray-600 outline-none focus:ring-2 focus:ring-blue-500 shadow-sm"
            >
              <option value="all">All Priorities</option>
              <option value="high">High</option>
              <option value="normal">Normal</option>
              <option value="low">Low</option>
            </select>
          </div>

          <AddTask userId={user.id} onTaskAdded={() => fetchTasks(user)} />
          {/* Pass the authenticated user's ID and a callback to refresh the task list after adding a new task. */}
        </div>

        {/* The four columns (todo, in-progress, in-review, done), taking filtering into account. */}
        <DragDropContext onDragEnd={onDragEnd}>
          <div className="flex gap-6 pb-4">
            <Column
              title="To Do"
              status="todo"
              tasks={filteredTasks.filter((t) => t.status === "todo")}
              onTaskUpdate={() => fetchTasks(user)} // Pass a callback to refresh the task list after updating a task (after adding, deleting, or drag-and-drop).
            />
            <Column
              title="In Progress"
              status="in_progress"
              tasks={filteredTasks.filter((t) => t.status === "in_progress")}
              onTaskUpdate={() => fetchTasks(user)} // Pass a callback to refresh the task list after updating a task (after adding, deleting, or drag-and-drop).
            />
            <Column
              title="In Review"
              status="in_review"
              tasks={filteredTasks.filter((t) => t.status === "in_review")}
              onTaskUpdate={() => fetchTasks(user)} // Pass a callback to refresh the task list after updating a task (after adding, deleting, or drag-and-drop).
            />
            <Column
              title="Done"
              status="done"
              tasks={filteredTasks.filter((t) => t.status === "done")}
              onTaskUpdate={() => fetchTasks(user)} // Pass a callback to refresh the task list after updating a task (after adding, deleting, or drag-and-drop).
            />
          </div>
        </DragDropContext>
      </main>
    </div>
  );
}
export default App; // Export the App component as the default export of this module, so it can be imported and used in other parts of the app (like index.tsx).
