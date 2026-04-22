Kanban Task Board
-
Vercel Live Link: https://task-manager-assessment-eta.vercel.app/ 

This is an advanced, responsive, Kanban-style drag-and-drop task board that helps people manage their workflows. Users are authenticated with their own guest accounts and can create and control their tasks with robust data persistence.

Key Features: 
- 
- Guest Authentication: The project uses Supabase Anonymous Auth, permitting users to test the application immediately as a guest without any login.
- Intelligent Task Management:

    - Drag-and-Drop: Used "@hello-pangea/dnd" for easy and dynamic task reordering.
      
    - Priority Badges: Color-coded indicators for Low (green), Normal (yellow), and High (red) priority tasks.
      
    - Smart Due Dates: Tasks that are past due are highlighted in red as determined by local timezone parsing logic.
 
    - Search & Filtering: Display of tasks can be filtered by their titles or by their priorities.
 
    - Board Summary / Statistics: The numbers of total tasks, completed tasks, and overdue tasks are shown in the top-right corner, which dynamically changes based on filtering. 
- Optimistic UI Updates: The states are updated locally first prior to the Supabase request completing, offering a delay-free experience no matter the connection speed. 

Tech Stack:
- 
- Framework: React 18 (Vite)
- Language: TypeScript (Strict Mode)
- Styling: Tailwind CSS (Modern "Linear" Aesthetic)
- Backend: Supabase (PostgreSQL & Row-Level Security)
- Deployment: Vercel (CI/CD Pipeline)

Sample of Engineering Obstacles & Solutions: 
-
1. "Off-By-One" Date Bug

     - Obstacle: The normal JavaScript "Date" objects had due dates that shifted back by one day due to UTC timezone offsets.
     - Solution: I wrote code that manually parsed the ISO date string into separate components (month, day, year), then I rendered each of them after fixing the offset in order for the correct date to be displayed regardless of the user's timezone. 
2. Database Integrity (CHECK Constraints)

     - Obstacle: Storing only valid priority levels (Low, Normal, High) in the Supabase database.
     - Solution: I built a SQL CHECK Constraint and Column Defaults in Supabase to make sure that the data was consistent between the frontend and the backend. 

How to Set Up and Run Locally: 
- 
1. Clone the Repository:

     - git clone https://github.com/EthanLe-hub/Task-Manager-Assessment
     - cd task-board
2. Install:

     - npm install
  
3. Environment Setup:

     - Create a ".env" file with your "VITE_SUPABASE_URL" and "VITE_SUPABASE_ANON_KEY" variables.
4. Run:

     - npm run dev
  
Sample Image of My Application:
-
<img width="1481" height="949" alt="image" src="https://github.com/user-attachments/assets/d02edeeb-a7ba-4579-8cfe-90c78f2bc2f1" />

