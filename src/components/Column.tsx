import { Droppable } from "@hello-pangea/dnd"; // For drag-and-drop functionality.
import { Task } from "../taskFields"; // Import Task type, containing the fields for a task.
import TaskCard from "./TaskCard"; // Import the TaskCard component, which represents an individual task in the UI.

interface ColumnProps {
  // Define fields for the Column component.
  title: string; // Title of the column (todo, in progress, in review, done).
  status: string; // Status of the task (internally: todo, in progress, in review, done).
  tasks: Task[]; // The tasks themselves (inside an array).
  onTaskUpdate: () => void; // Function to call when a task is updated (e.g., after add, delete, or drag-and-drop).
}

const Column = ({ title, status, tasks, onTaskUpdate }: ColumnProps) => {
  return (
    <div className="bg-gray-100 p-4 rounded-lg w-72 min-h-[500px] flex flex-col">
      <h2 className="font-semibold mb-4 text-gray-700 uppercase text-sm tracking-widest">
        {title} ({tasks.length})
      </h2>

      <Droppable droppableId={status}>
        {/* Make the column a droppable area for drag-and-drop. */}
        {(provided) => (
          <div
            {...provided.droppableProps} // Spread the droppable props provided by the Droppable component to enable drag-and-drop functionality.
            ref={provided.innerRef}
            className="flex-grow"
          >
            {tasks.map(
              (
                task,
                index, // Map through the tasks array and render a TaskCard for each task, passing the task data and index as props/fields.
              ) => (
                <TaskCard
                  key={task.id}
                  task={task}
                  index={index}
                  onTaskDeleted={onTaskUpdate} // Pass the onTaskUpdate function to the TaskCard, so that when a task is deleted, the parent component (Column.tsx) can refresh the task list and reflect the deletion in the UI.
                />
              ),
            )}
            {provided.placeholder}
          </div>
        )}
      </Droppable>
    </div>
  );
};

export default Column;
