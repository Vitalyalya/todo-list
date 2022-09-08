const form = document.querySelector(".task-form");
const input = document.querySelector(".input");
const taskInput = document.querySelector(".input-task");
const text = document.querySelector(".task-text");

const taskList = document.querySelector(".collection");
const collDone = document.querySelector(".collection-done");
const collItem = document.querySelector(".collection-item");

const delTask = document.querySelector(".delete-item");

const checkTaskInput = document.querySelector(".container");

const checkmark = document.querySelector(".checkmark");
const clearAll = document.querySelector(".btn");

const colors = document.querySelector(".colors");
const palette = document.querySelector(".color-palette");

const colorPicker = document.querySelectorAll(".color");

loadEventListeners();

function loadEventListeners() {
  // DOM Load event
  document.addEventListener("DOMContentLoaded", getTasks);

  // Add task
  form.addEventListener("submit", addTask);

  //Actions with tasks
  taskList.addEventListener("click", taskActions);
  collDone.addEventListener("click", taskActions);

  //clear all tasks
  clearAll.addEventListener("click", clearAllTasks);

  //showing the available colors
  palette.addEventListener("click", function () {
    colors.classList.toggle("show");
  });

  //picking a color for a task
  colorPicker.forEach(function (color) {
    color.addEventListener("click", function (e) {
      input.style.backgroundColor = e.target.className.split(" ")[1];
      input.focus();

      colors.classList.toggle("show");
    });
  });
}

//code of adding the task to the DOM
function addProcess(inputValue, appendPlace, isChecked, color) {
  const li = document.createElement("li");
  li.className = "collection-item";

  const firstA = document.createElement("div");
  firstA.className = isChecked ? "checkmark checked" : "checkmark";
  firstA.innerHTML =
    '<ion-icon class="done-icon" name="checkmark-outline"></ion-icon>';

  const taskInputCont = document.createElement("div");
  taskInputCont.className = "text-plus-input";
  const taskInput = document.createElement("input");
  const p = document.createElement("p");
  taskInputCont.appendChild(p);
  taskInputCont.appendChild(taskInput);
  taskInput.className = "input input-task";

  p.textContent = inputValue;

  p.className = isChecked ? "task-text done" : "task-text";

  const a = document.createElement("div");
  a.className = "delete-item";
  a.innerHTML =
    ' <ion-icon class="delete-icon" name="trash-outline"></ion-icon';

  const a2 = document.createElement("div");
  a2.className = "edit-item";
  a2.innerHTML =
    '<ion-icon class="delete-icon" name="create-outline"></ion-icon>';

  li.appendChild(firstA);
  li.appendChild(taskInputCont);
  li.appendChild(a2);
  li.appendChild(a);

  taskInput.style.backgroundColor = color;

  li.style.backgroundColor = color;

  if (appendPlace == collDone) {
    li.style.opacity = "0.5";
  }

  // Append or prepend li to ul
  if (isChecked === null) {
    appendPlace.prepend(li);
  } else {
    isChecked ? appendPlace.prepend(li) : appendPlace.append(li);
  }

  //checking which animation to add
  if (isChecked || isChecked === null) {
    collDone.style.transformOrigin = "center right";
    li.animate(
      [
        {
          transform: "translateY(-40%) rotate(-7deg)",
        },
        { transform: "translate(0) rotate(0deg)" },
      ],
      {
        duration: 150,
      }
    );
  } else {
    li.animate(
      [
        {
          transform: "translateY(40%) rotate(7deg)",
        },
        { transform: "translate(0) rotate(0deg)" },
      ],
      {
        duration: 150,
      }
    );
  }
  taskInput.value = p.textContent;
}

//adding task, selecting the variables to send to the function that adds the tasks
function addTask(e) {
  e.preventDefault();
  let inputValue = document.querySelector(".input").value;
  let inputColor = input.style.backgroundColor;
  if (inputColor === "") {
    inputColor = "#fff";
  }

  if (input.value) {
    addProcess(inputValue, taskList, null, inputColor);
    storeTaskInLocalStorage(inputValue, "taskList", false, inputColor);

    // Clear input
    input.value = "";
  } else {
    alert("Can't be empty");
  }
}

//Actions with tasks
function taskActions(e) {
  //delete item
  if (e.target.classList.contains("delete-item")) {
    deleteTask(e);
  }

  //edit task
  if (e.target.classList.contains("edit-item")) {
    let input = e.target.previousSibling.lastChild;

    //make input for task visible
    input.style.zIndex = 1;
    input.focus();

    //saving the task after clicking outside the task
    checkTaskInput.addEventListener("focusout", function (e) {
      if (e.target.className == "input input-task") {
        editHelper(e);
      }
    });

    //saving the task after pressing 'enter'
    checkTaskInput.addEventListener("keyup", function (e) {
      if (e.target.className == "input input-task" && e.key === "Enter") {
        e.target.blur();
      }
    });
  }

  //mark done and move to the "done" section
  if (e.target.className === "checkmark") {
    markDone(e);
  }

  //remove "done" and move to "tasks" section
  if (e.target.className === "checkmark checked") {
    removeDone(e);
  }
}

//delete a task
function deleteTask(e) {
  e.target.parentElement.animate(
    [
      { transform: "translateY(0)", opacity: "1" },
      { transform: "translateX(-50%)", opacity: "0" },
    ],
    {
      duration: 200,
      fill: "forwards",
    }
  );

  setTimeout(function () {
    e.target.parentElement.remove();

    checkIfAnyDoneLeft();
  }, 300);

  if (e.target.previousSibling.previousSibling.classList.length == 1) {
    removeTaskFromLocalStorage(
      e.target.previousSibling.previousSibling.textContent,
      "taskList",
      false
    );
  } else {
    removeTaskFromLocalStorage(
      e.target.previousSibling.previousSibling.textContent,
      "collDone",
      true
    );
  }
}

//mark a task "done" and move to the "done tasks" section
function markDone(e) {
  collDone.style.display = "block";

  let inputValue = e.target.nextSibling.textContent;

  let inputColor = e.target.parentElement.style.backgroundColor;

  addProcess(inputValue, collDone, true, inputColor);

  storeTaskInLocalStorage(inputValue, "collDone", true, inputColor);

  removeTaskFromLocalStorage(inputValue, "taskList", false);

  e.target.parentElement.remove();
}

//remove "done" and move to the "active tasks" section
function removeDone(e) {
  let inputValue = e.target.nextSibling.textContent;

  let inputColor = e.target.parentElement.style.backgroundColor;

  addProcess(inputValue, taskList, false, inputColor);

  //append or prepend - to save the order of the tasks
  let appen = true;
  storeTaskInLocalStorage(inputValue, "taskList", false, inputColor, appen);

  removeTaskFromLocalStorage(inputValue, "collDone", true);

  e.target.parentElement.remove();

  checkIfAnyDoneLeft();

  return 0;
}

//helper function to try to make the code readable
function editHelper(e) {
  if (e.target.className == "input input-task") {
    let taskItem = e.target.previousSibling.textContent;
    let taskLoc = e.target.parentElement.parentElement.parentElement.classList;
    let taskChecked = e.target.parentElement.previousSibling.classList;
    let newTaskItem = e.target.value;

    if (taskLoc == "collection") {
      editTask(taskItem, "taskList", false, newTaskItem, e.target);
    } else {
      editTask(taskItem, "collDone", true, newTaskItem, e.target);
    }
    e.target.previousSibling.textContent = e.target.value;
  }
}

//actual task editing
function editTask(taskItem, taskLoc, taskChecked, newTaskItem, newInput) {
  let tasks;
  if (localStorage.getItem("tasks") === null) {
    tasks = [];
  } else {
    tasks = JSON.parse(localStorage.getItem("tasks"));
  }
  tasks.forEach(function (task) {
    //for debugging purposes

    // console.log(task[0], taskItem);
    // console.log(task[1], taskLoc);
    // console.log(task[2], taskChecked);

    if (taskItem == task[0] && taskLoc == task[1] && taskChecked == task[2]) {
      task[0] = newTaskItem;
      taskItem = null;
    }
  });

  localStorage.setItem("tasks", JSON.stringify(tasks));

  newInput.style.zIndex = -1;
}

//clearing all tasks
function clearAllTasks() {
  while (taskList.firstChild) {
    taskList.removeChild(taskList.firstChild);
  }

  while (collDone.firstChild) {
    collDone.removeChild(collDone.firstChild);
  }

  collDone.style.display = "none";
  localStorage.clear();
}

//check if there are any "done" tasks left and if none, remove the "done" section from the dom
function checkIfAnyDoneLeft() {
  if (!collDone.firstChild) {
    collDone.style.display = "none";
  }
}

//storing tasks in the local storage
function storeTaskInLocalStorage(task, place, isChecked, inputColor, appen) {
  let tasks;
  if (localStorage.getItem("tasks") === null) {
    tasks = [];
  } else {
    tasks = JSON.parse(localStorage.getItem("tasks"));
  }

  //storing in the right order
  if (appen) {
    tasks.push([task, place, isChecked, inputColor]);
  } else {
    tasks.unshift([task, place, isChecked, inputColor]);
  }

  localStorage.setItem("tasks", JSON.stringify(tasks));
}

//removing tasks from the local storage
function removeTaskFromLocalStorage(taskItem, taskLoc, taskChecked) {
  let tasks;
  if (localStorage.getItem("tasks") === null) {
    tasks = [];
  } else {
    tasks = JSON.parse(localStorage.getItem("tasks"));
  }

  tasks.forEach(function (task, index) {
    //for debugging purposes
    // console.log(index);

    // console.log(task[0], `12 ${taskItem}`);
    // console.log(task[1], taskLoc);
    // console.log(task[2], taskChecked);

    if (taskItem == task[0] && taskLoc == task[1] && taskChecked == task[2]) {
      tasks.splice(index, 1);
      taskItem = null;
    }
  });

  localStorage.setItem("tasks", JSON.stringify(tasks));
}

//getting tasks from the local storage
function getTasks() {
  let tasks;
  if (localStorage.getItem("tasks") === null) {
    tasks = [];
  } else {
    tasks = JSON.parse(localStorage.getItem("tasks"));
  }

  tasks.forEach(function (task) {
    addFromStorageProcess(task[0], task[1], task[2], task[3]);
  });
}

//actual process of adding tasks from the local storage
//needed because some variables are strings and it was pretty hard to add tasks
//from storage and from input correctly using only one function
function addFromStorageProcess(inputValue, appendPlace, isChecked, inputColor) {
  const li = document.createElement("li");
  li.className = "collection-item";

  const firstA = document.createElement("div");
  firstA.className = isChecked ? "checkmark checked" : "checkmark";
  firstA.innerHTML =
    '<ion-icon class="done-icon" name="checkmark-outline"></ion-icon>';

  const a = document.createElement("div");
  a.className = "delete-item";
  a.innerHTML = '<ion-icon class="delete-icon" name="trash-outline"></ion-icon';

  const a2 = document.createElement("div");
  a2.className = "edit-item";
  a2.innerHTML =
    ' <ion-icon class="edit-icon" name="create-outline"></ion-icon>';

  const taskInputCont = document.createElement("div");
  taskInputCont.className = "text-plus-input";
  const taskInput = document.createElement("input");
  const p = document.createElement("p");
  p.textContent = inputValue;

  p.className = isChecked ? "task-text done" : "task-text";

  taskInputCont.appendChild(p);
  taskInputCont.appendChild(taskInput);
  taskInput.className = "input input-task";

  li.appendChild(firstA);
  li.appendChild(taskInputCont);
  li.appendChild(a2);
  li.appendChild(a);

  taskInput.style.backgroundColor = inputColor;

  li.style.backgroundColor = inputColor;

  if (appendPlace == "collDone") {
    li.style.opacity = "0.5";
  }

  // Append li to ul
  if (appendPlace == "taskList") {
    if (isChecked === "null") {
      taskList.prepend(li);
    } else {
      isChecked == "true" ? taskList.prepend(li) : taskList.append(li);
    }
  } else {
    collDone.style.display = "block";
    if (isChecked === "null") {
      taskList.prepend(li);
    } else {
      isChecked == "true" ? collDone.prepend(li) : collDone.append(li);
    }
  }

  //checking which animation to add
  if (isChecked != "false") {
    collDone.style.transformOrigin = "center right";
    li.animate(
      [
        {
          transform: "translateY(-40%) rotate(-7deg)",
        },
        { transform: "translate(0) rotate(0deg)" },
      ],
      {
        duration: 150,
      }
    );
  } else {
    li.animate(
      [
        {
          transform: "translateY(40%) rotate(7deg)",
        },
        { transform: "translate(0) rotate(0deg)" },
      ],
      {
        duration: 150,
      }
    );
  }

  taskInput.value = p.textContent;
}
