import React, { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";

const UserList = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUsers = async () => {
      const { data, error } = await supabase.from("users").select("*");
      if (error) {
        console.error("❌ Error fetching users:", error.message);
      } else {
        console.log("✅ Users fetched:", data);
        setUsers(data);
      }
      setLoading(false);
    };

    fetchUsers();
  }, []);

  if (loading) return <p>Loading users...</p>;

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-2">👥 User List</h2>
      {users.length === 0 ? (
        <p>No users found.</p>
      ) : (
        <ul>
          {users.map((u) => (
            <li key={u.id}>{u.name || `User #${u.id}`}</li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default UserList;
