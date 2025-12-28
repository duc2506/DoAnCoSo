let todos = [];
let categories = [];
let currentFilter = "all";
let currentCategoryFilter = null;
let currentPriorityFilter = null;
let searchQuery = "";

// Khởi tạo các modal Bootstrap
const todoModal = new bootstrap.Modal(document.getElementById("todo-modal"));
const categoryModal = new bootstrap.Modal(document.getElementById("category-modal"));
const confirmModal = new bootstrap.Modal(document.getElementById("confirm-modal"));

// Lấy danh sách công việc và danh mục khi trang được tải
async function fetchTodos() {
  const token = localStorage.getItem("jwt");
  if (!token) {
    showToast("Bạn chưa đăng nhập.", "error");
    return;
  }

  try {
    const response = await fetch("http://localhost:8080/api/todos", {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      if (response.status === 401) {
        localStorage.removeItem("jwt");
        document.getElementById("auth-section").classList.remove("hidden");
        document.getElementById("app-section").classList.add("hidden");
        throw new Error("Phiên đăng nhập hết hạn, vui lòng đăng nhập lại.");
      }
      throw new Error("Không thể lấy danh sách công việc");
    }

    todos = await response.json() || [];
    if (todos.length === 0) {
      showToast("Hiện tại không có công việc nào.", "info");
    }
    renderTodos();
  } catch (error) {
    showToast(error.message, "error");
  }
}

// Fetch Categories
async function fetchCategories() {
  const token = localStorage.getItem("jwt");
  if (!token) {
    showToast("Bạn chưa đăng nhập.", "error");
    return;
  }

  try {
    const response = await fetch("http://localhost:8080/api/categories", {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      if (response.status === 401) {
        localStorage.removeItem("jwt");
        document.getElementById("auth-section").classList.remove("hidden");
        document.getElementById("app-section").classList.add("hidden");
        throw new Error("Phiên đăng nhập hết hạn, vui lòng đăng nhập lại.");
      }
      throw new Error("Không thể lấy danh sách danh mục");
    }

    categories = await response.json() || [];
    if (categories.length === 0) {
      showToast("Hiện tại không có danh mục nào.", "info");
    }
    renderCategories();
    renderCategoryCheckboxes();
  } catch (error) {
    showToast(error.message, "error");
  }
}

// Hiển thị công việc với bộ lọc theo trạng thái 
function renderTodos() {
  const todosContainer = document.getElementById("todos-container");
  if (!todosContainer) {
    console.error("Element with ID 'todos-container' not found.");
    return;
  }
  todosContainer.innerHTML = "";

  let filteredTodos = [...todos];

  if (currentFilter === "completed") {
    filteredTodos = filteredTodos.filter((todo) => todo.completed);
  } else if (currentFilter === "pending") {
    filteredTodos = filteredTodos.filter((todo) => !todo.completed);
  }

  if (currentCategoryFilter) {
    filteredTodos = filteredTodos.filter((todo) =>
      todo.categoryIds && todo.categoryIds.includes(currentCategoryFilter)
    );
  }

  if (currentPriorityFilter) {
    filteredTodos = filteredTodos.filter(
      (todo) => todo.priorityLevel === currentPriorityFilter
    );
  }

  if (searchQuery) {
    const query = searchQuery.toLowerCase();
    filteredTodos = filteredTodos.filter(
      (todo) =>
        todo.title.toLowerCase().includes(query) ||
        (todo.description && todo.description.toLowerCase().includes(query))
    );
  }

  filteredTodos.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

  if (filteredTodos.length === 0) {
    todosContainer.innerHTML = `<div class="empty-state"><p>Không có công việc nào phù hợp với bộ lọc.</p></div>`;
    return;
  }

  filteredTodos.forEach((todo) => {
    const todoElement = document.createElement("div");
    todoElement.className = "todo-item";
    todoElement.setAttribute("data-id", todo.id); // Thêm data-id để dễ tìm kiếm
    todoElement.style.borderLeftColor = getPriorityColor(todo.priorityLevel);

    let createdDate = "Không xác định";
    if (todo.createdAt) {
      try {
        const date = new Date(todo.createdAt);
        if (!isNaN(date.getTime())) {
          createdDate = date.toLocaleDateString("vi-VN", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
          });
        }
      } catch (error) {
        console.error("Error parsing createdAt:", error);
      }
    }

    let dueDate = "";
    if (todo.dueDate) {
      try {
        const date = new Date(todo.dueDate);
        if (!isNaN(date.getTime())) {
          dueDate = date.toLocaleString("vi-VN", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
          });
        }
      } catch (error) {
        console.error("Error parsing dueDate:", error);
      }
    }

    const categoriesHtml = (todo.categoryIds || [])
      .map((catId) => {
        const category = categories.find((c) => c.id === catId);
        return category
          ? `<span class="todo-category" style="background-color: ${
              category.color || "#3498db"
            }">${category.name}</span>`
          : "";
      })
      .filter(Boolean)
      .join("");

    todoElement.innerHTML = `
      <div class="todo-header d-flex justify-content-between align-items-center">
        <div class="d-flex align-items-center">
          <input type="checkbox" class="complete-checkbox me-2" ${
            todo.completed ? "checked" : ""
          }>
          <h3 class="todo-title ${todo.completed ? "completed" : ""} mb-0">${
      todo.title
    }</h3>
        </div>
        <div class="todo-actions">
          <button class="todo-action-btn edit" title="Chỉnh sửa công việc">
            <i class="fas fa-edit"></i>
          </button>
          <button class="todo-action-btn delete" title="Xóa công việc">
            <i class="fas fa-trash"></i>
          </button>
        </div>
      </div>
      <div class="todo-details">
        ${todo.description ? `<p>${todo.description}</p>` : ""}
        <div class="todo-categories">${categoriesHtml}</div>
      </div>
      <div class="todo-meta">
        <div class="todo-priority">
          <span class="priority-dot ${todo.priorityLevel.toLowerCase()}"></span>
          Ưu tiên: ${getPriorityText(todo.priorityLevel)}
        </div>
        ${dueDate ? `<div class="todo-due-date">Hạn: ${dueDate}</div>` : ""}
        <div class="todo-created">Tạo: ${createdDate}</div>
      </div>
    `;

    const checkbox = todoElement.querySelector(".complete-checkbox");
    checkbox.addEventListener("change", () =>
      toggleTodoComplete(todo.id, checkbox.checked)
    );

    todoElement
      .querySelector(".edit")
      .addEventListener("click", () => openEditTodoModal(todo));
    todoElement.querySelector(".delete").addEventListener("click", () =>
      openConfirmModal(
        "Xóa công việc",
        `Bạn có chắc chắn muốn xóa "${todo.title}"?`,
        () => deleteTodo(todo.id)
      )
    );

    todosContainer.appendChild(todoElement);
  });
}

// Render Categories
function renderCategories() {
  const categoryList = document.getElementById("category-list");
  if (!categoryList) {
    console.error("Element with ID 'category-list' not found.");
    return;
  }
  categoryList.innerHTML = "";

  categories.forEach((category) => {
    const categoryElement = document.createElement("li");
    categoryElement.setAttribute("data-id", category.id);
    categoryElement.className =
      currentCategoryFilter === category.id ? "active" : "";
    categoryElement.style.borderLeft = `4px solid ${
      category.color || "#3498db"
    }`;

    categoryElement.innerHTML = `
      <span class="category-name">${category.name}</span>
      <div class="category-actions">
        <button class="category-action-btn edit" title="Chỉnh sửa danh mục"><i class="fas fa-edit"></i></button>
        <button class="category-action-btn delete" title="Xóa danh mục"><i class="fas fa-trash"></i></button>
      </div>
    `;

    categoryElement.addEventListener("click", function (e) {
      if (!e.target.closest(".category-action-btn")) {
        document
          .querySelectorAll(".category-list li")
          .forEach((li) => li.classList.remove("active"));
        if (currentCategoryFilter === category.id) {
          currentCategoryFilter = null;
        } else {
          currentCategoryFilter = category.id;
          categoryElement.classList.add("active");
        }
        renderTodos();
      }
    });

    categoryElement.querySelector(".edit").addEventListener("click", (e) => {
      e.stopPropagation();
      openEditCategoryModal(category);
    });

    categoryElement.querySelector(".delete").addEventListener("click", (e) => {
      e.stopPropagation();
      openConfirmModal(
        "Xóa danh mục",
        `Bạn có chắc chắn muốn xóa "${category.name}"?`,
        () => deleteCategory(category.id)
      );
    });

    categoryList.appendChild(categoryElement);
  });
}

// Render Category Checkboxes
function renderCategoryCheckboxes() {
  const categoriesContainer = document.getElementById("todo-categories");
  if (!categoriesContainer) {
    console.error("Element with ID 'todo-categories' not found.");
    return;
  }
  categoriesContainer.innerHTML = "";
  if (categories.length === 0) {
    categoriesContainer.innerHTML = "<p>Chưa có danh mục nào.</p>";
    return;
  }

  categories.forEach((category) => {
    const checkboxItem = document.createElement("div");
    checkboxItem.className = "checkbox-item";
    checkboxItem.innerHTML = `
      <input type="checkbox" id="category-${category.id}" value="${
      category.id
    }" name="categories">
      <label for="category-${category.id}" style="color: ${
      category.color || "#3498db"
    }">${category.name}</label>
    `;
    categoriesContainer.appendChild(checkboxItem);
  });
}

// Thêm công việc 
async function addTodo(todoData) {
  const token = localStorage.getItem("jwt");
  if (!token) {
    showToast("Bạn chưa đăng nhập.", "error");
    return;
  }

  todoData.completed = todoData.completed ?? false;
  if (todoData.dueDate) {
    try {
      const dueDate = new Date(todoData.dueDate);
      if (isNaN(dueDate.getTime())) {
        throw new Error("Ngày không hợp lệ");
      }
      todoData.dueDate = dueDate.toISOString();
    } catch (error) {
      showToast("Ngày không hợp lệ, vui lòng kiểm tra lại.", "error");
      return;
    }
  } else {
    todoData.dueDate = null;
  }

  if (!Array.isArray(todoData.categoryIds)) {
    todoData.categoryIds = [];
  }

  if (!todoData.priorityLevel) {
    todoData.priorityLevel = "MEDIUM";
  }

  try {
    const response = await fetch("http://localhost:8080/api/todos", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(todoData),
    });

    if (!response.ok) {
      if (response.status === 401) {
        localStorage.removeItem("jwt");
        document.getElementById("auth-section").classList.remove("hidden");
        document.getElementById("app-section").classList.add("hidden");
        throw new Error("Phiên đăng nhập hết hạn, vui lòng đăng nhập lại.");
      }
      const errorText = await response.text();
      throw new Error(errorText || "Không thể thêm công việc");
    }

    const newTodo = await response.json();
    todos.push(newTodo);
    renderTodos();
    todoModal.hide();
    showToast("Đã thêm công việc", "success");
  } catch (error) {
    showToast(`Lỗi khi thêm công việc: ${error.message}`, "error");
  }
}

//
async function updateTodo(todoId, todoData) {
  const token = localStorage.getItem("jwt");
  if (!token) {
    showToast("Bạn chưa đăng nhập.", "error");
    return;
  }

  todoId = parseInt(todoId);
  if (isNaN(todoId)) {
    showToast("ID công việc không hợp lệ.", "error");
    return;
  }

  const currentTodo = todos.find((t) => t.id === todoId);
  if (!currentTodo) {
    showToast("Không tìm thấy công việc để cập nhật.", "error");
    return;
  }

  const updatedTodoData = {
    title: todoData.title || currentTodo.title,
    description:
      todoData.description !== undefined
        ? todoData.description
        : currentTodo.description,
    dueDate:
      todoData.dueDate !== undefined ? todoData.dueDate : currentTodo.dueDate,
    priorityLevel: todoData.priorityLevel || currentTodo.priorityLevel,
    completed: todoData.completed !== undefined ? todoData.completed : currentTodo.completed,
    categoryIds: Array.isArray(todoData.categoryIds)
      ? todoData.categoryIds
      : currentTodo.categoryIds || [],
  };

  if (updatedTodoData.dueDate) {
    try {
      const dueDate = new Date(updatedTodoData.dueDate);
      if (isNaN(dueDate.getTime())) {
        throw new Error("Ngày không hợp lệ");
      }
      updatedTodoData.dueDate = dueDate.toISOString();
    } catch (error) {
      showToast("Ngày không hợp lệ, vui lòng kiểm tra lại.", "error");
      return;
    }
  } else {
    updatedTodoData.dueDate = null;
  }

  try {
    const response = await fetch(`http://localhost:8080/api/todos/${todoId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(updatedTodoData),
    });

    if (!response.ok) {
      if (response.status === 401) {
        localStorage.removeItem("jwt");
        document.getElementById("auth-section").classList.remove("hidden");
        document.getElementById("app-section").classList.add("hidden");
        throw new Error("Phiên đăng nhập hết hạn, vui lòng đăng nhập lại.");
      }
      const errorText = await response.text();
      throw new Error(errorText || "Không thể cập nhật công việc");
    }

    const updatedTodo = await response.json();
    const index = todos.findIndex((t) => t.id === todoId);
    if (index !== -1) {
      todos[index] = updatedTodo;
    } else {
      await fetchTodos();
    }
    renderTodos();
    todoModal.hide();
    showToast("Đã cập nhật công việc", "success");
  } catch (error) {
    showToast(`Lỗi khi cập nhật công việc: ${error.message}`, "error");
  }
}

// Delete Todo
async function deleteTodo(todoId) {
  const token = localStorage.getItem("jwt");
  if (!token) {
    showToast("Bạn chưa đăng nhập.", "error");
    return;
  }

  try {
    const response = await fetch(`http://localhost:8080/api/todos/${todoId}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      if (response.status === 401) {
        localStorage.removeItem("jwt");
        document.getElementById("auth-section").classList.remove("hidden");
        document.getElementById("app-section").classList.add("hidden");
        throw new Error("Phiên đăng nhập hết hạn, vui lòng đăng nhập lại.");
      }
      throw new Error("Không thể xóa công việc");
    }

    todos = todos.filter((t) => t.id !== todoId);
    renderTodos();
    confirmModal.hide();
    showToast("Đã xóa công việc", "success");
  } catch (error) {
    showToast(error.message, "error");
  }
}

// Toggle Todo Complete
async function toggleTodoComplete(todoId, completed) {
  const token = localStorage.getItem("jwt");
  if (!token) {
    showToast("Bạn chưa đăng nhập.", "error");
    return;
  }

  // Cập nhật trạng thái cục bộ trước để giao diện phản ánh ngay lập tức
  const todoIndex = todos.findIndex((t) => t.id === todoId);
  if (todoIndex === -1) {
    showToast("Không tìm thấy công việc.", "error");
    return;
  }

  const originalCompleted = todos[todoIndex].completed;
  todos[todoIndex].completed = completed; // Cập nhật trạng thái cục bộ
  renderTodos(); // Cập nhật giao diện ngay lập tức

  try {
    const response = await fetch(
      `http://localhost:8080/api/todos/${todoId}/toggle`, // Sửa endpoint từ /complete thành /toggle
      {
        method: "PATCH", // Sử dụng PATCH thay vì PUT để phù hợp với @PatchMapping
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );

    if (!response.ok) {
      if (response.status === 401) {
        localStorage.removeItem("jwt");
        document.getElementById("auth-section").classList.remove("hidden");
        document.getElementById("app-section").classList.add("hidden");
        throw new Error("Phiên đăng nhập hết hạn, vui lòng đăng nhập lại.");
      }
      throw new Error("Không thể cập nhật trạng thái công việc");
    }

    const updatedTodo = await response.json();
    todos[todoIndex] = updatedTodo; // Đồng bộ với dữ liệu từ server
    renderTodos(); // Cập nhật lại giao diện để đảm bảo đồng bộ
    showToast(
      `Đã ${completed ? "hoàn thành" : "hủy hoàn thành"} công việc`,
      "success"
    );
  } catch (error) {
    // Nếu API thất bại, hoàn tác trạng thái cục bộ
    todos[todoIndex].completed = originalCompleted;
    renderTodos();
    showToast(error.message, "error");
  }
}

// Add Category
async function addCategory(categoryData) {
  const token = localStorage.getItem("jwt");
  if (!token) {
    showToast("Bạn chưa đăng nhập.", "error");
    return;
  }

  if (!categoryData.name || categoryData.name.trim() === "") {
    showToast("Tên danh mục không được để trống.", "error");
    return;
  }
  if (!categoryData.color || !/^#[0-9A-F]{6}$/i.test(categoryData.color)) {
    showToast("Màu sắc không hợp lệ. Vui lòng chọn màu dạng #RRGGBB.", "error");
    return;
  }

  try {
    const response = await fetch("http://localhost:8080/api/categories", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(categoryData),
    });

    if (!response.ok) {
      if (response.status === 401) {
        localStorage.removeItem("jwt");
        document.getElementById("auth-section").classList.remove("hidden");
        document.getElementById("app-section").classList.add("hidden");
        throw new Error("Phiên đăng nhập hết hạn, vui lòng đăng nhập lại.");
      }
      const errorData = await response.json();
      throw new Error(errorData.error || "Không thể thêm danh mục. Vui lòng kiểm tra lại.");
    }

    const newCategory = await response.json();
    categories.push(newCategory);
    renderCategories();
    renderCategoryCheckboxes();
    categoryModal.hide();
    showToast("Đã thêm danh mục", "success");
  } catch (error) {
    console.error("Error adding category:", error);
    showToast(error.message, "error");
  }
}

// Update Category
async function updateCategory(categoryId, categoryData) {
  const token = localStorage.getItem("jwt");
  if (!token) {
    showToast("Bạn chưa đăng nhập.", "error");
    return;
  }

  try {
    const response = await fetch(
      `http://localhost:8080/api/categories/${categoryId}`,
      {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(categoryData),
      }
    );

    if (!response.ok) {
      if (response.status === 401) {
        localStorage.removeItem("jwt");
        document.getElementById("auth-section").classList.remove("hidden");
        document.getElementById("app-section").classList.add("hidden");
        throw new Error("Phiên đăng nhập hết hạn, vui lòng đăng nhập lại.");
      }
      const errorData = await response.json();
      throw new Error(errorData.error || "Không thể cập nhật danh mục.");
    }

    const updatedCategory = await response.json();
    const index = categories.findIndex((c) => c.id === categoryId);
    if (index !== -1) categories[index] = updatedCategory;
    renderCategories();
    renderCategoryCheckboxes();
    await fetchTodos();
    categoryModal.hide();
    showToast("Đã cập nhật danh mục", "success");
  } catch (error) {
    showToast(error.message, "error");
  }
}

// Delete Category
async function deleteCategory(categoryId) {
  const token = localStorage.getItem("jwt");
  if (!token) {
    showToast("Bạn chưa đăng nhập.", "error");
    return;
  }

  try {
    const response = await fetch(
      `http://localhost:8080/api/categories/${categoryId}`,
      {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );

    if (!response.ok) {
      if (response.status === 401) {
        localStorage.removeItem("jwt");
        document.getElementById("auth-section").classList.remove("hidden");
        document.getElementById("app-section").classList.add("hidden");
        throw new Error("Phiên đăng nhập hết hạn, vui lòng đăng nhập lại.");
      }
      const errorData = await response.json();
      throw new Error(
        errorData.error || "Không thể xóa danh mục. Vui lòng xóa các công việc liên quan trước."
      );
    }

    categories = categories.filter((c) => c.id !== categoryId);
    if (currentCategoryFilter === categoryId) currentCategoryFilter = null;
    renderCategories();
    renderCategoryCheckboxes();
    await fetchTodos();
    confirmModal.hide();
    showToast("Đã xóa danh mục", "success");
  } catch (error) {
    showToast(error.message, "error");
  }
}

// Modal Functions
function openAddTodoModal() {
  const modalTitle = document.getElementById("modal-title");
  const todoForm = document.getElementById("todo-form");
  const todoIdInput = document.getElementById("todo-id");
  if (!modalTitle || !todoForm || !todoIdInput) {
    console.error("Required elements for add todo modal not found.");
    return;
  }
  modalTitle.textContent = "Thêm công việc mới";
  todoForm.reset();
  todoIdInput.value = "";
  document
    .querySelectorAll('#todo-categories input[type="checkbox"]')
    .forEach((cb) => (cb.checked = false));
  renderCategoryCheckboxes();
  todoModal.show();
}

function openEditTodoModal(todo) {
  const modalTitle = document.getElementById("modal-title");
  const todoIdInput = document.getElementById("todo-id");
  const todoTitleInput = document.getElementById("todo-title");
  const todoDescriptionInput = document.getElementById("todo-description");
  const todoPriorityInput = document.getElementById("todo-priority");
  const todoDueDateInput = document.getElementById("todo-due-date");

  if (
    !modalTitle ||
    !todoIdInput ||
    !todoTitleInput ||
    !todoDescriptionInput ||
    !todoPriorityInput ||
    !todoDueDateInput
  ) {
    console.error("Required elements for edit todo modal not found.");
    showToast("Không thể mở form chỉnh sửa công việc.", "error");
    return;
  }

  modalTitle.textContent = "Chỉnh sửa công việc";
  todoIdInput.value = todo.id || "";
  todoTitleInput.value = todo.title || "";
  todoDescriptionInput.value = todo.description || "";
  todoPriorityInput.value = todo.priorityLevel || "MEDIUM";

  if (todo.dueDate) {
    try {
      const dueDate = new Date(todo.dueDate);
      if (!isNaN(dueDate.getTime())) {
        todoDueDateInput.value = dueDate.toISOString().slice(0, 16);
      } else {
        todoDueDateInput.value = "";
      }
    } catch (error) {
      console.error("Error parsing dueDate:", error);
      todoDueDateInput.value = "";
    }
  } else {
    todoDueDateInput.value = "";
  }

  renderCategoryCheckboxes();
  setTimeout(() => {
    document
      .querySelectorAll('#todo-categories input[type="checkbox"]')
      .forEach((cb) => {
        const categoryId = parseInt(cb.value);
        cb.checked = todo.categoryIds && todo.categoryIds.includes(categoryId);
      });
  }, 100);

  todoModal.show();
}

const todoForm = document.getElementById("todo-form");
if (todoForm) {
  todoForm.addEventListener("submit", function (e) {
    e.preventDefault();

    const todoIdInput = document.getElementById("todo-id");
    const todoTitleInput = document.getElementById("todo-title");
    const todoDescriptionInput = document.getElementById("todo-description");
    const todoDueDateInput = document.getElementById("todo-due-date");
    const todoPriorityInput = document.getElementById("todo-priority");

    if (
      !todoIdInput ||
      !todoTitleInput ||
      !todoDescriptionInput ||
      !todoDueDateInput ||
      !todoPriorityInput
    ) {
      showToast("Không tìm thấy các trường cần thiết trong form.", "error");
      return;
    }

    const todoId = todoIdInput.value;
    const title = todoTitleInput.value.trim();
    if (!title) {
      showToast("Tiêu đề không được để trống", "error");
      return;
    }

    const description = todoDescriptionInput.value.trim() || null;
    const dueDate = todoDueDateInput.value || null;
    const priorityLevel = todoPriorityInput.value || "MEDIUM";

    const selectedCategories = Array.from(
      document.querySelectorAll(
        '#todo-categories input[type="checkbox"]:checked'
      )
    ).map((cb) => parseInt(cb.value));

    const todoData = {
      title,
      description,
      dueDate,
      priorityLevel,
      categoryIds: selectedCategories.length > 0 ? selectedCategories : [],
    };

    if (todoId) {
      updateTodo(parseInt(todoId), todoData);
    } else {
      addTodo(todoData);
    }
  });
} else {
  console.error("Element with ID 'todo-form' not found.");
}

function openAddCategoryModal() {
  const categoryModalTitle = document.getElementById("category-modal-title");
  const categoryForm = document.getElementById("category-form");
  const categoryIdInput = document.getElementById("category-id");
  const categoryColorInput = document.getElementById("category-color");
  if (
    !categoryModalTitle ||
    !categoryForm ||
    !categoryIdInput ||
    !categoryColorInput
  ) {
    console.error("Required elements for add category modal not found.");
    return;
  }
  categoryModalTitle.textContent = "Thêm danh mục mới";
  categoryForm.reset();
  categoryIdInput.value = "";
  categoryColorInput.value = "#3498db";
  categoryModal.show();
}

function openEditCategoryModal(category) {
  const categoryModalTitle = document.getElementById("category-modal-title");
  const categoryIdInput = document.getElementById("category-id");
  const categoryNameInput = document.getElementById("category-name");
  const categoryColorInput = document.getElementById("category-color");
  if (
    !categoryModalTitle ||
    !categoryIdInput ||
    !categoryNameInput ||
    !categoryColorInput
  ) {
    console.error("Required elements for edit category modal not found.");
    return;
  }
  categoryModalTitle.textContent = "Chỉnh sửa danh mục";
  categoryIdInput.value = category.id;
  categoryNameInput.value = category.name;
  categoryColorInput.value = category.color || "#3498db";
  categoryModal.show();
}

const categoryForm = document.getElementById("category-form");
if (categoryForm) {
  categoryForm.addEventListener("submit", function (e) {
    e.preventDefault();
    const categoryIdInput = document.getElementById("category-id");
    const categoryNameInput = document.getElementById("category-name");
    const categoryColorInput = document.getElementById("category-color");
    if (!categoryIdInput || !categoryNameInput || !categoryColorInput) {
      showToast(
        "Không tìm thấy các trường cần thiết trong form danh mục.",
        "error"
      );
      return;
    }
    const categoryId = categoryIdInput.value;
    const name = categoryNameInput.value.trim();
    const color = categoryColorInput.value;

    if (!name) {
      showToast("Tên danh mục không được để trống", "error");
      return;
    }

    const categoryData = { name, color };

    if (categoryId) {
      updateCategory(parseInt(categoryId), categoryData);
    } else {
      addCategory(categoryData);
    }
  });
} else {
  console.error("Element with ID 'category-form' not found.");
}

// Utility Functions
function getPriorityText(priority) {
  return (
    { HIGH: "Cao", MEDIUM: "Trung bình", LOW: "Thấp" }[priority] ||
    "Không xác định"
  );
}

function getPriorityColor(priority) {
  return { HIGH: "#dc3545", MEDIUM: "#f39c12", LOW: "#28a745" }[priority] || "#007bff";
}

function openConfirmModal(title, message, onConfirm) {
  const confirmTitle = document.getElementById("confirm-title");
  const confirmMessage = document.getElementById("confirm-message");
  const confirmOk = document.getElementById("confirm-ok");
  if (!confirmTitle || !confirmMessage || !confirmOk) {
    console.error("Required elements for confirm modal not found.");
    return;
  }
  confirmTitle.textContent = title;
  confirmMessage.textContent = message;
  confirmOk.onclick = onConfirm;
  confirmModal.show();
}

// Event Listeners
const addTodoBtn = document.getElementById("add-todo-btn");
if (addTodoBtn) {
  addTodoBtn.addEventListener("click", openAddTodoModal);
} else {
  console.error("Element with ID 'add-todo-btn' not found.");
}

const addCategoryBtn = document.getElementById("add-category-btn");
if (addCategoryBtn) {
  addCategoryBtn.addEventListener("click", openAddCategoryModal);
} else {
  console.error("Element with ID 'add-category-btn' not found.");
}

const filterItems = document.querySelectorAll(".filter-list li");
filterItems.forEach((filter) =>
  filter.addEventListener("click", function () {
    document
      .querySelectorAll(".filter-list li")
      .forEach((f) => f.classList.remove("active"));
    this.classList.add("active");
    currentFilter = this.getAttribute("data-filter");
    renderTodos();
  })
);

const priorityItems = document.querySelectorAll(".priority-list li");
priorityItems.forEach((priority) =>
  priority.addEventListener("click", function () {
    const value = this.getAttribute("data-priority");
    if (currentPriorityFilter === value) {
      currentPriorityFilter = null;
      this.classList.remove("active");
    } else {
      document
        .querySelectorAll(".priority-list li")
        .forEach((p) => p.classList.remove("active"));
      currentPriorityFilter = value;
      this.classList.add("active");
    }
    renderTodos();
  })
);

const searchInput = document.getElementById("search-input");
if (searchInput) {
  searchInput.addEventListener("input", function () {
    searchQuery = this.value.trim();
    renderTodos();
  });
} else {
  console.error("Element with ID 'search-input' not found.");
}

const searchBtn = document.getElementById("search-btn");
if (searchBtn) {
  searchBtn.addEventListener("click", function () {
    searchQuery = searchInput.value.trim();
    renderTodos();
  });
} else {
  console.error("Element with ID 'search-btn' not found.");
}