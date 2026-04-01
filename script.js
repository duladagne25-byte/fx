// ========== DATA STORAGE ==========
let students = JSON.parse(localStorage.getItem('students')) || [];
let currentUser = JSON.parse(localStorage.getItem('currentUser')) || null;
let messages = JSON.parse(localStorage.getItem('messages')) || [];
let payments = JSON.parse(localStorage.getItem('payments')) || [];
let files = JSON.parse(localStorage.getItem('files')) || [];

// Create default admin if no users
if (students.length === 0) {
    students.push({
        id: 1,
        fullName: "Admin",
        email: "admin@forex.com",
        password: "admin123",
        country: "Ethiopia",
        city: "Addis",
        phone: "0912345678",
        isAdmin: true,
        courses: 0,
        lessons: 0
    });
    localStorage.setItem('students', JSON.stringify(students));
}

// ========== PAGE NAVIGATION ==========
function showPage(pageName) {
    document.querySelectorAll('.page').forEach(page => {
        page.classList.remove('active-page');
        page.style.display = 'none';
    });
    document.getElementById(pageName).style.display = 'block';
    document.getElementById(pageName).classList.add('active-page');
    
    if (pageName === 'dashboard') updateDashboard();
    if (pageName === 'settings') loadUserSettings();
    if (pageName === 'home') updateStudentCount();
}

// ========== UPDATE STUDENT COUNT ==========
function updateStudentCount() {
    let count = document.getElementById('studentCount');
    if (count) count.innerText = students.length;
}

// ========== SIGNUP ==========
document.getElementById('signupForm')?.addEventListener('submit', function(e) {
    e.preventDefault();
    
    let password = document.getElementById('password').value;
    let confirm = document.getElementById('confirmPassword').value;
    
    if (password !== confirm) {
        showMessage("Passwords don't match!", "error");
        return;
    }
    
    let email = document.getElementById('email').value;
    if (students.find(s => s.email === email)) {
        showMessage("Email already exists!", "error");
        return;
    }
    
    let newUser = {
        id: Date.now(),
        fullName: document.getElementById('fullName').value,
        email: email,
        password: password,
        country: document.getElementById('country').value,
        city: document.getElementById('city').value,
        phone: document.getElementById('phone').value,
        isAdmin: false,
        courses: 0,
        lessons: 0,
        date: new Date().toISOString()
    };
    
    students.push(newUser);
    localStorage.setItem('students', JSON.stringify(students));
    showMessage("Account created! Please login.", "success");
    showPage('login');
    this.reset();
});

// ========== LOGIN ==========
document.getElementById('loginForm')?.addEventListener('submit', function(e) {
    e.preventDefault();
    
    let email = document.getElementById('loginEmail').value;
    let password = document.getElementById('loginPassword').value;
    
    let user = students.find(s => s.email === email && s.password === password);
    
    if (user) {
        currentUser = user;
        localStorage.setItem('currentUser', JSON.stringify(currentUser));
        showMessage(`Welcome ${user.fullName}!`, "success");
        showPage('dashboard');
    } else {
        showMessage("Invalid email or password!", "error");
    }
});

// ========== LOGOUT ==========
function logout() {
    currentUser = null;
    localStorage.removeItem('currentUser');
    showMessage("Logged out!", "success");
    showPage('home');
}

// ========== CONTACT FORM ==========
document.getElementById('contactForm')?.addEventListener('submit', function(e) {
    e.preventDefault();
    
    let msg = {
        id: Date.now(),
        name: document.getElementById('contactName').value,
        email: document.getElementById('contactEmail').value,
        subject: document.getElementById('contactSubject').value,
        message: document.getElementById('contactMessage').value,
        date: new Date().toISOString()
    };
    
    messages.push(msg);
    localStorage.setItem('messages', JSON.stringify(messages));
    showMessage("Message sent! We'll reply soon.", "success");
    this.reset();
});

// ========== DASHBOARD ==========
function updateDashboard() {
    if (!currentUser) return;
    
    document.getElementById('studentName').innerText = currentUser.fullName;
    document.getElementById('coursesCount').innerText = currentUser.courses || 0;
    document.getElementById('lessonsCount').innerText = currentUser.lessons || 0;
    
    // Show user files
    let userFiles = files.filter(f => f.userEmail === currentUser.email);
    let fileDiv = document.getElementById('fileList');
    if (fileDiv) {
        if (userFiles.length === 0) {
            fileDiv.innerHTML = '<p style="color:#999; text-align:center">No files uploaded</p>';
        } else {
            fileDiv.innerHTML = userFiles.map(f => `
                <div style="background:#f8f9fa; padding:10px; margin:5px 0; border-radius:8px">
                    📄 ${f.name} <small>(${new Date(f.date).toLocaleDateString()})</small>
                    <button onclick="viewFile('${f.id}')" style="float:right; background:#667eea; color:white; border:none; padding:2px 10px; border-radius:5px">View</button>
                </div>
            `).join('');
        }
    }
    
    // Show admin panel if admin
    let adminPanel = document.getElementById('adminPanel');
    if (currentUser.isAdmin) {
        adminPanel.style.display = 'block';
        showAdminTab('students');
    } else {
        adminPanel.style.display = 'none';
    }
}

// ========== UPLOAD FILE ==========
function uploadFile(input) {
    let file = input.files[0];
    if (!file) return;
    
    if (file.size > 5 * 1024 * 1024) {
        showMessage("File too big! Max 5MB", "error");
        return;
    }
    
    let reader = new FileReader();
    reader.onload = function(e) {
        let fileData = {
            id: Date.now().toString(),
            name: file.name,
            type: file.type,
            data: e.target.result,
            userEmail: currentUser.email,
            userName: currentUser.fullName,
            date: new Date().toISOString()
        };
        files.push(fileData);
        localStorage.setItem('files', JSON.stringify(files));
        showMessage("File uploaded!", "success");
        updateDashboard();
    };
    reader.readAsDataURL(file);
}

// ========== VIEW FILE ==========
function viewFile(id) {
    let file = files.find(f => f.id === id);
    if (file) {
        let win = window.open();
        if (file.type.startsWith('image/')) {
            win.document.write(`<img src="${file.data}" style="max-width:100%">`);
        } else {
            win.document.write(`<iframe src="${file.data}" width="100%" height="100%"></iframe>`);
        }
    }
}

// ========== PAYMENT ==========
let selectedPayment = null;

function showPayment(method) {
    selectedPayment = method;
    let info = {
        telebirr: "📱 Tele Birr: 09XX-XXX-XXX<br>Send payment and upload screenshot",
        binance: "₿ Binance ID: 123456789<br>USDT Address: Txxxx...",
        cbe: "🏦 CBE Account: 1000XXXXXX<br>Name: Forex Academy",
        awash: "🏦 Awash Bank: 013XXXXXX<br>Name: Forex Academy"
    };
    document.getElementById('paymentInfo').innerHTML = info[method];
    document.getElementById('paymentModal').style.display = 'flex';
}

function closeModal() {
    document.getElementById('paymentModal').style.display = 'none';
}

function submitPayment() {
    let transactionId = document.getElementById('transactionId').value;
    let proof = document.getElementById('paymentProof').files[0];
    
    if (!transactionId || !proof) {
        showMessage("Please fill all fields!", "error");
        return;
    }
    
    let reader = new FileReader();
    reader.onload = function(e) {
        let payment = {
            id: Date.now(),
            method: selectedPayment,
            transactionId: transactionId,
            proof: e.target.result,
            userEmail: currentUser.email,
            userName: currentUser.fullName,
            amount: 5000,
            status: "pending",
            date: new Date().toISOString()
        };
        payments.push(payment);
        localStorage.setItem('payments', JSON.stringify(payments));
        showMessage("Payment submitted! Admin will verify.", "success");
        closeModal();
        document.getElementById('transactionId').value = '';
        document.getElementById('paymentProof').value = '';
    };
    reader.readAsDataURL(proof);
}

// ========== ADMIN FUNCTIONS ==========
function showAdminTab(tab) {
    let content = document.getElementById('adminContent');
    
    if (tab === 'students') {
        content.innerHTML = '<h3>📋 Registered Students</h3>';
        students.forEach(s => {
            content.innerHTML += `
                <div class="student-item">
                    <div>
                        <strong>${s.fullName}</strong><br>
                        ${s.email} | ${s.phone} | ${s.city}
                    </div>
                    ${!s.isAdmin ? `<button class="delete-btn" onclick="deleteStudent(${s.id})">Delete</button>` : '<span style="color:#667eea">Admin</span>'}
                </div>
            `;
        });
    }
    else if (tab === 'messages') {
        content.innerHTML = '<h3>💬 Contact Messages</h3>';
        if (messages.length === 0) {
            content.innerHTML += '<p>No messages yet</p>';
        } else {
            messages.forEach(m => {
                content.innerHTML += `
                    <div class="message-item">
                        <div>
                            <strong>${m.name}</strong> (${m.email})<br>
                            <b>${m.subject}</b><br>
                            ${m.message}<br>
                            <small>${new Date(m.date).toLocaleString()}</small>
                        </div>
                    </div>
                `;
            });
        }
    }
    else if (tab === 'payments') {
        content.innerHTML = '<h3>💰 Payment Requests</h3>';
        let pendingPayments = payments.filter(p => p.status === 'pending');
        if (pendingPayments.length === 0) {
            content.innerHTML += '<p>No pending payments</p>';
        } else {
            pendingPayments.forEach(p => {
                content.innerHTML += `
                    <div class="payment-item">
                        <div>
                            <strong>${p.userName}</strong> (${p.userEmail})<br>
                            Method: ${p.method} | Amount: ${p.amount} ETB<br>
                            Transaction: ${p.transactionId}<br>
                            <small>${new Date(p.date).toLocaleString()}</small>
                        </div>
                        <button class="delete-btn" onclick="approvePayment(${p.id})">✓ Approve</button>
                    </div>
                `;
            });
        }
    }
    else if (tab === 'uploads') {
        content.innerHTML = '<h3>📁 Student Uploads</h3>';
        if (files.length === 0) {
            content.innerHTML += '<p>No files uploaded</p>';
        } else {
            files.forEach(f => {
                content.innerHTML += `
                    <div class="student-item">
                        <div>
                            <strong>${f.userName}</strong> (${f.userEmail})<br>
                            📄 ${f.name}<br>
                            <small>${new Date(f.date).toLocaleString()}</small>
                        </div>
                        <button class="delete-btn" onclick="viewFile('${f.id}')">View</button>
                    </div>
                `;
            });
        }
    }
}

function deleteStudent(id) {
    if (confirm("Delete this student?")) {
        students = students.filter(s => s.id !== id);
        localStorage.setItem('students', JSON.stringify(students));
        showMessage("Student deleted!", "success");
        showAdminTab('students');
        updateStudentCount();
    }
}

function approvePayment(id) {
    let payment = payments.find(p => p.id === id);
    if (payment) {
        payment.status = 'approved';
        localStorage.setItem('payments', JSON.stringify(payments));
        showMessage("Payment approved!", "success");
        showAdminTab('payments');
    }
}

// ========== SETTINGS ==========
function loadUserSettings() {
    if (currentUser) {
        document.getElementById('settingsName').value = currentUser.fullName || '';
        document.getElementById('settingsEmail').value = currentUser.email || '';
        document.getElementById('settingsPhone').value = currentUser.phone || '';
        document.getElementById('settingsCity').value = currentUser.city || '';
    }
}

document.getElementById('settingsForm')?.addEventListener('submit', function(e) {
    e.preventDefault();
    
    if (currentUser) {
        currentUser.fullName = document.getElementById('settingsName').value;
        currentUser.email = document.getElementById('settingsEmail').value;
        currentUser.phone = document.getElementById('settingsPhone').value;
        currentUser.city = document.getElementById('settingsCity').value;
        
        let index = students.findIndex(s => s.id === currentUser.id);
        if (index !== -1) students[index] = currentUser;
        
        localStorage.setItem('students', JSON.stringify(students));
        localStorage.setItem('currentUser', JSON.stringify(currentUser));
        showMessage("Profile updated!", "success");
    }
});

// ========== SHOW MESSAGE ==========
function showMessage(msg, type) {
    let div = document.createElement('div');
    div.className = type === 'success' ? 'success' : 'error';
    div.innerText = msg;
    div.style.position = 'fixed';
    div.style.top = '80px';
    div.style.right = '20px';
    div.style.zIndex = '9999';
    div.style.padding = '12px 20px';
    div.style.borderRadius = '10px';
    div.style.boxShadow = '0 5px 15px rgba(0,0,0,0.2)';
    document.body.appendChild(div);
    setTimeout(() => div.remove(), 3000);
}

// ========== INITIAL LOAD ==========
document.addEventListener('DOMContentLoaded', () => {
    updateStudentCount();
    let hash = window.location.hash.substring(1);
    if (hash && ['home','about','contact','login','signup','dashboard','settings'].includes(hash)) {
        showPage(hash);
    } else {
        showPage('home');
    }
});
