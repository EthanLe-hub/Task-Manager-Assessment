import { Draggable } from "@hello-pangea/dnd"; // For drag-and-drop functionality.
import { Task } from "../taskFields"; // For creating a task (retrieve the fields needed to create it).
import { supabaseClient } from "../supabaseClient"; // For database operations (e.g., deleting a task).

interface TaskCardProps {
  task: Task;
  index: number;
  onTaskDeleted: () => void; // Function to call when a task is deleted, so that the parent component (Column.tsx) can refresh the task list and reflect the deletion in the UI.
}

const TaskCard = ({ task, index, onTaskDeleted }: TaskCardProps) => {
  const deleteTask = async () => {
    const { error } = await supabaseClient
      .from("tasks")
      .delete()
      .eq("id", task.id); // Delete the task from the Supabase database using the task's unique identifier (id).

    if (error) {
      console.error("Error deleting the task: ", error); // Log error if deletion failed.
    } else {
      onTaskDeleted(); // If deletion succeeds, call onTaskDeleted to refresh task list in parent component (Column.tsx) and reflect deletion in the UI.
    }
  };

  // Helper function to color-code the priority of the task (red = high, yellow = normal, green = low, gray = default/none):
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "bg-red-100 text-red-700 border-red-200";
      case "normal":
        return "bg-yellow-100 text-yellow-700 border-yellow-200";
      case "low":
        return "bg-green-100 text-green-700 border-green-200";
      default:
        return "bg-gray-100 text-gray-700 border-gray-200";
    }
  };

  const isPastDue = task.due_date
    ? new Date(task.due_date) < new Date()
    : false; // Check if the task is past its due date (if a due date was set). True if past due date, false if not past due date or if no due date was set.

  let dateVisual = ""; // Initialize a variable to hold the formatted due date for display in the UI (like "Jan 1, 2026").

  // If task has a due date, format it for display in the UI.
  if (task.due_date) {
    const [year, month, day] = task.due_date.split("-").map(Number); // Split the due date string (in "YYYY-MM-DD" format).
    dateVisual = new Date(year, month - 1, day).toLocaleDateString(undefined, {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  }

  // Draggable-and-droppable TaskCard with a task (has all fields for a task) and its index (position in the list).
  return (
    <Draggable draggableId={task.id} index={index}>
      {(provided) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          className="bg-white p-4 mb-3 rounded-lg shadow-sm border border-gray-200 group relative hover:border-blue-300 transition-all"
        >
          <div className="flex justify-between items-start">
            <p className="text-gray-800 text-sm font-medium">{task.title}</p>
            <button
              onClick={deleteTask} // When delete button is clicked, call deleteTask function to remove task from Supabase database and refresh UI.
              className="text-gray-300 hover:text-red-500 text-xs font-bold px-1 ml-2 transition-colors"
              title="Delete Task"
            >
              X
            </button>
          </div>

          {/* Color-coded priority badge */}
          <span
            className={`w-fit px-2 py-0.5 rounded text-[10px] font-bold uppercase border ${getPriorityColor(task.priority)}`}
          >
            {task.priority}
          </span>

          {/* Due date badge (if due date is set) */}
          {task.due_date && (
            <div
              className={`flex items-center gap-1 mt-2 text-[10px] font-medium ${isPastDue ? "text-red-600" : "text-gray-500"}`}
            >
              <span>📅</span>
              <span>{dateVisual}</span>
              {/* Format the due date as "Jan 1, 2026". */}
              {isPastDue && <span className="ml-1 font-bold">(Past Due)</span>}
              {/* If the task is past its due date, show a "Past Due" label next to the due date. */}
            </div>
          )}
        </div>
      )}
    </Draggable>
  );
};

export default TaskCard;
