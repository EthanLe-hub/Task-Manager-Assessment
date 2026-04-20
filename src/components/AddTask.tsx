// Component that is an input field for adding a new task to the board. It includes a text input for the task and a button to submit the new task.
import { useState } from "react";
import { supabaseClient } from "../supabaseClient";

interface AddTaskProps {
  userId: string; // The specific user that this task is tied to.
  onTaskAdded: () => void; // After a task is successfully added, update the user's task list.
}

const AddTask = ({ userId, onTaskAdded }: AddTaskProps) => {
  const [task, setTask] = useState(""); // Task starts out as empty.
  const [priority, setPriority] = useState("normal"); // Priority starts out as "normal" by default.
  const [dueDate, setDueDate] = useState(""); // Due date for a task starts out as empty (no due date).

  const submitClicked = async (e: React.FormEvent) => {
    e.preventDefault(); // Prevent the default form submission behavior (page refresh).

    if (!task.trim()) {
      return; // Do nothing if no task was entered.
    }

    // Otherwise, insert the new task into the Supabase database.
    // "tasks" database table/spreadsheet has columns "title", "user_id", and "status" to store into.
    const { error } = await supabaseClient.from("tasks").insert([
      {
        title: task, // "title" is the column name in the SQL Editor in Supabase (take the text from the "task" state variable and store it into the "title" column in the database).
        user_id: userId, // "user_id" is the column name in the SQL Editor in Supabase (associate the new task with the current user).
        status: "todo", // "status" is the column name in the SQL Editor in Supabase (new tasks start in "To Do" by default).
        priority: priority, // "priority" is the column name in the SQL Editor in Supabase (store the priority of the task, which is "high" by default).
        due_date: dueDate || null, // "due_date" is the column name in the SQL Editor in Supabase (store the due date of the task, or null if no due date was set).
      },
    ]);

    if (error) {
      console.error("Error adding task:", error);
    } else {
      setTask(""); // Clear the input field.
      onTaskAdded(); // Tell the parent component to refresh the list.
    }
  };

  return (
    <div className="flex gap-2 mb-4">
      <form onSubmit={submitClicked} className="mb-4">
        <input
          type="text"
          placeholder="+ Add a task..."
          className="w-full p-2 rounded-md border border-gray-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all shadow-sm"
          value={task}
          onChange={(e) => setTask(e.target.value)} // Update the task state as the user types.
        />
        <select
          value={priority} // Set the value of the select dropdown to the current priority state.
          onChange={(e) => setPriority(e.target.value)} // Update the priority state when the user selects a different option.
          className="bg-white border border-gray-200 rounded-md px-2 text-xs focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all shadow-sm mt-2"
        >
          <option value="low">Low Priority</option>
          <option value="normal">Normal Priority</option>
          <option value="high">High Priority</option>
        </select>
        <input
          type="date"
          value={dueDate} // Set the value of the date input to the current dueDate local state.
          onChange={(e) => setDueDate(e.target.value)}
          className="bg-white border border-gray-200 rounded-md px-2 text-xs focus:ring-2 focus:ring-blue-500"
        />
      </form>
    </div>
  );
};

export default AddTask;
