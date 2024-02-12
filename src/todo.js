import React, { useState, useEffect } from 'react';
import './todo.css';
import Swal from 'sweetalert2';

function TodoApp() {
  const [tasks, setTasks] = useState([]);
  const [taskInput, setTaskInput] = useState('');
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    const storedTasks = JSON.parse(localStorage.getItem('todo-details'));
    if (storedTasks.length > 0) {
      setTasks(storedTasks);
    }
  },[]);

  useEffect(() => {
    localStorage.setItem('todo-details', JSON.stringify(tasks));
  }, [tasks]);

  const addTodoTask = () => {
    if (!taskInput.trim()) {
      alert('First enter your task!!');
      return;
    }

    const newTask = {
      id:  tasks.length >0 ? tasks[tasks.length - 1].id + 1 : 1,
      task: taskInput,
      pending: true,
      ongoing: false,
      completed: false,
      // startTimer: '0:0:0' ,
      // endTimer: '0:0:0',
      // duration: '0:0:0',
      timerValue: '0:0:0'
    };

    setTasks([...tasks, newTask]);
    setTaskInput('');
  };

  const handleChange = (e) => {
    setTaskInput(e.target.value);
  };

  const toggleStatus = (taskId, status) => {
    setTasks(tasks.map(task => {
      if (task.id === taskId) {
        if (!task.ongoing && status === 'completed') {
          alert('Complete the ongoing state before moving to Completed.');
          return task;
        }
        if (status === 'ongoing') {
          const startTime = new Date().toString();

          return {
            ...task,
            startTimer: startTime,
            pending: false,
            ongoing: true,
            completed: false
          };
        } 
        else if (status === 'completed') {
          const endTime = new Date().toString();

          const startTime = new Date(task.startTimer).getTime(); 
          const endTimeStamp = new Date(endTime).getTime(); 

          const duration = endTimeStamp - startTime;
          const seconds = Math.floor(duration / 1000) % 60;
          const minutes = Math.floor(duration / (1000 * 60)) % 60;
          const hours = Math.floor(duration / (1000 * 60 * 60));
          const Duration = `${hours}:${minutes}:${seconds}`;
          return {
            ...task,
            endTimer: endTime,
            duration: Duration,
            pending: false,
            ongoing: false,
            completed: true
          };
        }
        else if (status === 'pending') {
          return {
            ...task,
            timerValue: '0:0:0',
            pending: true,
            ongoing: false,
            completed: false
          };
        }
      }
      return task;
    }));
  };

  useEffect(() => {
    const intervalId = setInterval(() => {
      setTasks(prevTasks => {
        return prevTasks.map(task => {
          if (task.ongoing) {
            const startTime = new Date(task.startTimer).getTime();
            const currentTime = new Date().getTime();
            const elapsedTime = currentTime - startTime;
            const seconds = Math.floor(elapsedTime / 1000) % 60;
            const minutes = Math.floor(elapsedTime / (1000 * 60)) % 60;
            const hours = Math.floor(elapsedTime / (1000 * 60 * 60));
            const formattedTime = `${hours}:${minutes}:${seconds}`;
            return {
              ...task,
              timerValue: formattedTime
            };
          }
          return task;
        });
      });
    }, 1000);

    return () => clearInterval(intervalId);
  }, []);

  const updateBtn = (taskId) => {
    Swal.fire({
      title: "An input!",
      text: "Update Your Task",
      input: "text",
      showCancelButton: true,
      confirmButtonText: "Update",
      confirmButtonColor: "green",
      preConfirm: (inputValue) => {
        if (inputValue === "") {
          Swal.showValidationMessage("You need to write something!");
        }
      },
    }).then((result) => {
      if (result.isConfirmed) {
        const updatedTasks = tasks.map(task => {
          if (task.id === taskId) {
            return {
              ...task,
              task: result.value
            };
          }
          return task;
        });
        setTasks(updatedTasks);
        Swal.fire("Updated!", "Task has been updated to: " + result.value, "success");
      }
    });
  };

  const deleteBtn = (taskId) => {
    Swal.fire({
      title: "Are you sure?",
      text: "Once deleted, you will not be able to recover this task!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#dc3545",
      confirmButtonText: "Yes, delete it!",
      cancelButtonText: "No, cancel!",
    }).then((result) => {
      if (result.isConfirmed) {
        const updatedTasks = tasks.filter(task => task.id !== taskId);
        setTasks(updatedTasks);
        Swal.fire("Deleted!", "Your task has been deleted.", "success");
      }
    });
  };

  const clearCompleted = () => {
    Swal.fire({
      title: "Are you sure , you want to delete all completed task?",
      text: "Once deleted, you will not be able to recover this task!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#dc3545",
      confirmButtonText: "Yes, delete it!",
      cancelButtonText: "No, cancel!",
    }).then((result) => {
      if (result.isConfirmed) {
        const updatedTasks = tasks.filter(task => !task.completed);
        setTasks(updatedTasks);
        Swal.fire("Deleted!", "Your task has been deleted.", "success");
      }
    });
  };

  const clearAll = () => {
    Swal.fire({
      title: "Are you sure , you want to delete all task?",
      text: "Once deleted, you will not be able to recover this task!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#dc3545",
      confirmButtonText: "Yes, delete it!",
      cancelButtonText: "No, cancel!",
    }).then((result) => {
      if (result.isConfirmed) {
        setTasks([]);
        Swal.fire("Deleted!", "Your task has been deleted.", "success");
      }
    });
  };

  const filteredTasks = tasks.filter(task => {
    if (filter === 'pending') return task.pending;
    if (filter === 'ongoing') return task.ongoing;
    if (filter === 'completed') return task.completed;
    return true;
  });

  return (
    <div className="todo-template">
      <div className='container'>
        <div className="head">
          <h3>TODO</h3>
        </div>
        <div className="d-flex justify-content-center mt-4 m-3">
          <input
            type="text"
            className="task-input"
            placeholder="Create new task..."
            value={taskInput}
            onChange={handleChange}
          />
          <button className="btn ms-3" id="addbutton" onClick={addTodoTask}>Add</button>
        </div>

        <div className="text-white maindiv">
          <div className="filter-div" >
            <button className={`filter-button ${filter === 'all'}`} onClick={() => setFilter('all')}>All Task</button>
            <button className={`filter-button ${filter === 'pending'}`} onClick={() => setFilter('pending')}>Pending</button>
            <button className={`filter-button ${filter === 'ongoing'}`} onClick={() => setFilter('ongoing')}>Ongoing</button>
            <button className={`filter-button ${filter === 'completed'}`} onClick={() => setFilter('completed')}>Completed</button>
            <button className="delete-all-completed" id="delete-all-completed" onClick={clearCompleted}>Clear Completed</button>
            <button className="delete-all ms-2" id="delete-all" onClick={clearAll}>Clear All</button>
          </div>

          <div id="todotext" className="todotext">
            {filteredTasks.map(task => (
              <div className='todop' key={task.id}>
                <div className='three-state-toggle-button'>
                  <button onClick={() => toggleStatus(task.id, 'pending')} className='toggle-button pending-btn' style={{ backgroundColor: task.pending ? "red" : "" }}></button>
                  <button onClick={() => toggleStatus(task.id, 'ongoing')} className='toggle-button ongoing-btn' style={{ backgroundColor: task.ongoing ? "orange" : "" }}></button>
                  <button onClick={() => toggleStatus(task.id, 'completed')} className='toggle-button completed-btn' style={{ backgroundColor: task.completed ? "green" : "" }}></button>
                </div>
                <p className={`todo-text ${task.completed ? 'strike' : ''}`}>{task.task}</p>
                <p className='timer'>{task.timerValue}</p>
                <div className="update-delete-btn">
                  <button className='btn update-btn btn-success' onClick={() => updateBtn(task.id)} disabled={task.ongoing || task.completed}>Update</button>
                  <button className='btn delete-btn btn-danger ms-2' onClick={() => deleteBtn(task.id)} disabled={task.ongoing}>Delete</button>
                </div>
              </div>
            ))}
          </div>

        </div>
      </div>
    </div>
  );
}

export default TodoApp;
