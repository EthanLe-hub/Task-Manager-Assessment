// File that holds the Supabase client instance (supabaseUrl and supabaseAnonKey), which can be imported and used throughout the app. 
import { createClient } from '@supabase/supabase-js'; // Import the createClient function from the Supabase library. 

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL; // Get the Supabase URL from the environment variables (the .env file). 

const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY; // Get the Supabase anonymous key from the environment variables (the .env file). 

export const supabaseClient = createClient(supabaseUrl, supabaseAnonKey); // Create a Supabase client instance using the URL and the anonymous key, and export it for usage in other parts of the app. 