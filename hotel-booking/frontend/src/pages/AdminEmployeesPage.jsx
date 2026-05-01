import { useEffect, useState } from 'react';
import { api } from '../api/client';

export default function AdminEmployeesPage() {
  const [employees, setEmployees] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editingEmp, setEditingEmp] = useState(null);
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    role: 'STAFF',
    position: '',
    department: '',
    password: '',
    status: 'ACTIVE'
  });

  const load = async () => {
    try {
      const data = await api('/admin/employees');
      setEmployees(data);
    } catch (error) {
      console.error('Lỗi tải nhân viên:', error);
    }
  };

  useEffect(() => { load(); }, []);

  const handleOpenModal = (emp = null) => {
    if (emp) {
      setEditingEmp(emp);
      setFormData({
        first_name: emp.first_name,
        last_name: emp.last_name,
        email: emp.email,
        phone: emp.phone || '',
        role: emp.role,
        position: emp.position,
        department: emp.department,
        status: emp.status,
        password: ''
      });
    } else {
      setEditingEmp(null);
      setFormData({
        first_name: '',
        last_name: '',
        email: '',
        phone: '',
        role: 'STAFF',
        position: '',
        department: '',
        password: 'password123',
        status: 'ACTIVE'
      });
    }
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingEmp) {
        await api(`/admin/employees/${editingEmp.id}`, { method: 'PUT', body: formData });
      } else {
        await api('/admin/employees', { method: 'POST', body: formData });
      }
      setShowModal(false);
      load();
    } catch (error) {
      alert('Lỗi: ' + error.message);
    }
  };

  return (
    <div style={{ animation: 'fadeInUp 0.6s ease-out' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '40px' }}>
        <div>
          <h2 style={{ fontSize: '32px', fontWeight: '800', color: 'var(--primary)', letterSpacing: '-1px' }}>Nhân sự resort</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '16px' }}>Quản lý thông tin tài khoản và phân quyền cho đội ngũ vận hành.</p>
        </div>
        <button onClick={() => handleOpenModal()} className="btn-gold" style={{ padding: '12px 25px' }}>
          <i className="fas fa-plus" style={{ marginRight: '8px' }}></i> THÊM NHÂN VIÊN
        </button>
      </div>

      <div className="premium-table-container">
        <table>
          <thead>
            <tr>
              <th>Nhân viên</th>
              <th>Vai trò</th>
              <th>Bộ phận</th>
              <th>Vị trí</th>
              <th>Trạng thái</th>
              <th style={{ textAlign: 'center' }}>Tác vụ</th>
            </tr>
          </thead>
          <tbody>
            {employees.map((emp) => (
              <tr key={emp.id} className="table-row">
                <td>
                   <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                      <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'var(--gold-gradient)', color: 'var(--black)', display: 'flex', justifyContent: 'center', alignItems: 'center', fontWeight: '900' }}>
                         {emp.first_name[0]}
                      </div>
                      <div>
                         <div style={{ fontWeight: '700', color: 'var(--primary)' }}>{emp.first_name} {emp.last_name}</div>
                         <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{emp.email}</div>
                      </div>
                   </div>
                </td>
                <td><span style={{ fontSize: '11px', fontWeight: '800', color: 'var(--gold)', letterSpacing: '1px' }}>{emp.role}</span></td>
                <td>{emp.department}</td>
                <td>{emp.position}</td>
                <td>
                   <span style={{ 
                     padding: '4px 10px', borderRadius: '50px', fontSize: '11px', fontWeight: '700',
                     background: emp.status === 'ACTIVE' ? '#dcfce7' : '#fee2e2',
                     color: emp.status === 'ACTIVE' ? '#166534' : '#ef4444'
                   }}>
                     {emp.status === 'ACTIVE' ? 'ĐANG LÀM VIỆC' : 'ĐÃ KHÓA'}
                   </span>
                </td>
                <td style={{ textAlign: 'center' }}>
                   <button onClick={() => handleOpenModal(emp)} style={{ background: 'transparent', border: 'none', color: 'var(--primary)', cursor: 'pointer', fontSize: '16px' }}><i className="fas fa-user-edit"></i></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(15,23,42,0.4)', backdropFilter: 'blur(8px)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 }}>
          <form onSubmit={handleSubmit} style={{ backgroundColor: '#fff', width: '600px', borderRadius: '24px', padding: '40px' }}>
            <h3 style={{ fontSize: '24px', fontWeight: '800', color: 'var(--primary)', marginBottom: '32px' }}>{editingEmp ? 'Cập nhật nhân sự' : 'Tạo tài khoản nhân viên'}</h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                <div>
                   <label className="luxury-label">Tên</label>
                   <input required value={formData.first_name} onChange={e => setFormData({...formData, first_name: e.target.value})} style={{ width: '100%', padding: '12px', borderRadius: '10px', border: '1px solid #ddd' }} />
                </div>
                <div>
                   <label className="luxury-label">Họ & Tên lót</label>
                   <input required value={formData.last_name} onChange={e => setFormData({...formData, last_name: e.target.value})} style={{ width: '100%', padding: '12px', borderRadius: '10px', border: '1px solid #ddd' }} />
                </div>
                <div style={{ gridColumn: 'span 2' }}>
                   <label className="luxury-label">Email đăng nhập</label>
                   <input required type="email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} style={{ width: '100%', padding: '12px', borderRadius: '10px', border: '1px solid #ddd' }} />
                </div>
                {!editingEmp && (
                  <div style={{ gridColumn: 'span 2' }}>
                     <label className="luxury-label">Mật khẩu khởi tạo</label>
                     <input required type="password" value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} style={{ width: '100%', padding: '12px', borderRadius: '10px', border: '1px solid #ddd' }} />
                  </div>
                )}
                <div>
                   <label className="luxury-label">Bộ phận</label>
                   <select required value={formData.department} onChange={e => setFormData({...formData, department: e.target.value})} style={{ width: '100%', padding: '12px', borderRadius: '10px', border: '1px solid #ddd' }}>
                      <option value="">-- Chọn bộ phận --</option>
                      <option value="Tiền sảnh">Tiền sảnh (FO)</option>
                      <option value="Buồng phòng">Buồng phòng (HK)</option>
                      <option value="Ẩm thực">Ẩm thực (F&B)</option>
                      <option value="Kỹ thuật">Kỹ thuật</option>
                      <option value="Quản lý">Ban quản lý</option>
                   </select>
                </div>
                <div>
                   <label className="luxury-label">Vị trí công tác</label>
                   <input required value={formData.position} onChange={e => setFormData({...formData, position: e.target.value})} style={{ width: '100%', padding: '12px', borderRadius: '10px', border: '1px solid #ddd' }} />
                </div>
                <div>
                   <label className="luxury-label">Vai trò hệ thống</label>
                   <select required value={formData.role} onChange={e => setFormData({...formData, role: e.target.value})} style={{ width: '100%', padding: '12px', borderRadius: '10px', border: '1px solid #ddd' }}>
                      <option value="STAFF">Nhân viên (STAFF)</option>
                      <option value="ADMIN">Quản trị viên (ADMIN)</option>
                   </select>
                </div>
                <div>
                   <label className="luxury-label">Trạng thái</label>
                   <select required value={formData.status} onChange={e => setFormData({...formData, status: e.target.value})} style={{ width: '100%', padding: '12px', borderRadius: '10px', border: '1px solid #ddd' }}>
                      <option value="ACTIVE">Đang hoạt động</option>
                      <option value="LOCKED">Tạm khóa</option>
                   </select>
                </div>
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '16px', marginTop: '40px' }}>
              <button type="button" onClick={() => setShowModal(false)} style={{ padding: '12px 25px', borderRadius: '10px', border: 'none', background: '#f1f5f9', fontWeight: '700', cursor: 'pointer' }}>HỦY BỎ</button>
              <button type="submit" className="btn-accent" style={{ padding: '12px 35px' }}>XÁC NHẬN LƯU</button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
