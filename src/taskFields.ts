// Reference: https://www.geeksforgeeks.org/sql/uuid-function-in-mysql/ 
export type Status = 'todo' | 'in_progress' | 'in_review' | 'done'; // Define a TypeScript type for the possible statuses of a task. 

// "id", "title", "status", "user_id", "created_at", "priority", "due_date" are the fields/columns in the "tasks" table/spreadsheet in the Supabase database.
export interface Task {
    id: string; // Unique identifier for the task (UUID) -- retrieved from UUID function in MySQL as a string. 
    title: string; // Title of the task. 
    status: Status; // Status of the task, which must be one of the values defined in the Status type above. 
    user_id: string; // Identifier for the user who created the task (UUID) -- also retrieved from UUID function in MySQL as a string. 
    created_at: string; // Timestamp for when the task was created, stored as a string (ISO format). 
    priority: string; // Priority of the task (e.g., "high", "medium", "low"). 
    due_date: string | null; // Due date for the task, stored as a string (ISO format) or null if no due date was set. 
}