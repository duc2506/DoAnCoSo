// Xử lý chuyển đổi giữa tab đăng nhập và đăng ký
document.querySelectorAll('.nav-link').forEach(tab => {
  tab.addEventListener('click', function() {
    document.querySelectorAll('.nav-link').forEach(t => t.classList.remove('active'));
    this.classList.add('active');
  });
});

// Kiểm tra nếu đã đăng nhập
function checkAuth() {
  const token = localStorage.getItem('jwt');
  if (token) {
    fetch('http://localhost:8080/api/auth/validate', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    })
    .then(response => {
      if (response.ok) {
        document.getElementById('auth-section').style.display = 'none';
        document.getElementById('app-section').classList.remove('hidden');
        return fetch('http://localhost:8080/api/users/me', {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
      } else {
        localStorage.removeItem('jwt');
        throw new Error('Token không hợp lệ');
      }
    })
    .then(response => response.json())
    .then(user => {
      document.getElementById('username-display').innerText = user.username;
      fetchTodos(); // Gọi từ todo.js
      fetchCategories(); // Gọi từ todo.js
    })
    .catch(error => {
      console.error('Error:', error);
      showToast('Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.', 'error');
    });
  }
}

// Đăng nhập
document.getElementById('login-form-el').addEventListener('submit', function(e) {
  e.preventDefault();
  const username = document.getElementById('login-username').value.trim();
  const password = document.getElementById('login-password').value.trim();

  if (!username || !password) {
    showToast('Vui lòng nhập đầy đủ thông tin.', 'error');
    return;
  }

  fetch('http://localhost:8080/api/auth/login', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ username, password })
  })
  .then(response => {
    if (!response.ok) {
      throw new Error('Đăng nhập thất bại');
    }
    return response.json();
  })
  .then(data => {
    if (data.token) {
      localStorage.setItem('jwt', data.token);
      document.getElementById('auth-section').style.display = 'none';
      document.getElementById('app-section').classList.remove('hidden');
      document.getElementById('username-display').innerText = username;
      fetchTodos();
      fetchCategories();
      showToast('Đăng nhập thành công!', 'success');
    } else {
      showToast('Đăng nhập thất bại', 'error');
    }
  })
  .catch(error => {
    console.error('Error:', error);
    showToast('Đăng nhập thất bại. Vui lòng kiểm tra lại thông tin.', 'error');
  });
});

// Đăng ký
document.getElementById('register-form-el').addEventListener('submit', function(e) {
  e.preventDefault();
  const username = document.getElementById('register-username').value.trim();
  const email = document.getElementById('register-email').value.trim();
  const password = document.getElementById('register-password').value.trim();
  const fullName = document.getElementById('register-fullname').value.trim();

  if (!username || !email || !password) {
    showToast('Vui lòng nhập đầy đủ thông tin bắt buộc.', 'error');
    return;
  }

  fetch('http://localhost:8080/api/auth/register', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ username, email, password, fullName })
  })
  .then(response => {
    if (!response.ok) {
      return response.text().then(text => { throw new Error(text || 'Đăng ký thất bại'); });
    }
    return response.json();
  })
  .then(data => {
    showToast('Đăng ký thành công! Vui lòng đăng nhập.', 'success');
    document.querySelector('#login-tab').click();
    document.getElementById('login-username').value = username;
    document.getElementById('register-form-el').reset();
  })
  .catch(error => {
    console.error('Error:', error);
    showToast(`Đăng ký thất bại: ${error.message}`, 'error');
  });
});

// Đăng xuất
document.getElementById('logout-btn').addEventListener('click', function() {
  localStorage.removeItem('jwt');
  document.getElementById('auth-section').style.display = 'block';
  document.getElementById('app-section').classList.add('hidden');
  document.getElementById('login-form-el').reset();
  document.getElementById('register-form-el').reset();
  showToast('Đăng xuất thành công!', 'success');
});

// Hiển thị thông báo toast
function showToast(message, type = 'info') {
  const toast = document.getElementById('toast');
  toast.textContent = message;
  toast.className = 'toast align-items-center text-white border-0';
  toast.classList.add(type);
  toast.style.display = 'block';
  setTimeout(() => {
    toast.style.display = 'none';
  }, 3000);
}

// Kiểm tra đăng nhập khi tải trang
document.addEventListener('DOMContentLoaded', checkAuth);