// Mostrar datos del usuario y manejar edición/perfil
const user = JSON.parse(localStorage.getItem('user') || 'null');
const token = localStorage.getItem('token');

const profileName = document.getElementById('profileName');
const profileEmail = document.getElementById('profileEmail');
const profilePhone = document.getElementById('profilePhone');
const profileAddress = document.getElementById('profileAddress');
const editProfileBtn = document.getElementById('editProfileBtn');
const editProfileForm = document.getElementById('editProfileForm');
const cancelEditBtn = document.getElementById('cancelEditBtn');
const logoutBtn = document.getElementById('logoutBtn');
const donationHistoryBody = document.getElementById('donationHistoryBody');

if (!user || !token) {
    window.location.href = 'index.html';
}

function renderProfile() {
    profileName.textContent = user.name;
    profileEmail.textContent = user.email;
    profilePhone.textContent = user.phone || '';
    const addr = user.address || {};
    profileAddress.textContent = [addr.street, addr.city, addr.state].filter(Boolean).join(', ');
}

function fillEditForm() {
    editProfileForm.editName.value = user.name || '';
    editProfileForm.editPhone.value = user.phone || '';
    editProfileForm.editStreet.value = (user.address && user.address.street) || '';
    editProfileForm.editCity.value = (user.address && user.address.city) || '';
    editProfileForm.editState.value = (user.address && user.address.state) || '';
}

editProfileBtn.addEventListener('click', () => {
    fillEditForm();
    editProfileForm.classList.remove('hidden');
    editProfileBtn.style.display = 'none';
});

cancelEditBtn.addEventListener('click', () => {
    editProfileForm.classList.add('hidden');
    editProfileBtn.style.display = '';
});

editProfileForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const updated = {
        name: editProfileForm.editName.value,
        phone: editProfileForm.editPhone.value,
        address: {
            street: editProfileForm.editStreet.value,
            city: editProfileForm.editCity.value,
            state: editProfileForm.editState.value
        }
    };
    try {
        const res = await fetch(`http://localhost:3000/api/users/${user._id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(updated)
        });
        if (!res.ok) throw new Error('Error al actualizar usuario');
        const data = await res.json();
        localStorage.setItem('user', JSON.stringify(data.user));
        Object.assign(user, data.user);
        renderProfile();
        editProfileForm.classList.add('hidden');
        editProfileBtn.style.display = '';
        alert('Datos actualizados correctamente');
    } catch (err) {
        alert('Error al actualizar usuario');
    }
});

if (logoutBtn) {
    logoutBtn.style.display = 'inline-block';
    logoutBtn.addEventListener('click', () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = 'index.html';
    });
}

async function loadDonationHistory() {
    donationHistoryBody.innerHTML = '<tr><td colspan="4">Cargando...</td></tr>';
    try {
        const res = await fetch(`http://localhost:3000/api/donations?userId=${user._id}`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        if (!res.ok) throw new Error('Error al cargar historial');
        const data = await res.json();
        if (!data.donations.length) {
            donationHistoryBody.innerHTML = '<tr><td colspan="4">No hay donaciones registradas.</td></tr>';
            return;
        }
        donationHistoryBody.innerHTML = data.donations.map(d => `
            <tr>
                <td>${new Date(d.createdAt).toLocaleDateString()}</td>
                <td>${d.foodType || '-'}</td>
                <td>${d.quantity ? d.quantity.value + ' ' + d.quantity.unit : '-'}</td>
                <td>${d.status || '-'}</td>
            </tr>
        `).join('');
    } catch (err) {
        donationHistoryBody.innerHTML = '<tr><td colspan="4">Error al cargar historial.</td></tr>';
    }
}

renderProfile();
loadDonationHistory(); 