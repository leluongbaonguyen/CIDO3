import { useEffect, useState } from 'react';
import { api } from '../api/client';

export default function AdminEmployeesPage() {
  const [employees, setEmployees] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editingEmp, setEditingEmp] = useState(null);
  const [visibleCount, setVisibleCount] = useState(10);
  const [isScrollingLoading, setIsScrollingLoading] = useState(false);
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

  // Infinite Scroll Listener
  useEffect(() => {
    const handleScroll = () => {
      if (isScrollingLoading || visibleCount >= employees.length) return;
      
      const threshold = 100;
      const totalHeight = document.documentElement.scrollHeight;
      const scrollPosition = window.innerHeight + window.scrollY;
      
      if (totalHeight - scrollPosition < threshold) {
        setIsScrollingLoading(true);
        setTimeout(() => {
          setVisibleCount(prev => prev + 10);
          setIsScrollingLoading(false);
        }, 800);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [isScrollingLoading, visibleCount, employees.length]);

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
      alert('Lỗi lưu dữ liệu: ' + error.message);
    }
  };

  return (
    <div style={{ animation: 'fadeInUp 0.6s ease-out' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '40px' }}>
        <div>
          <h2 style={{ fontSize: '28px', fontWeight: '800', color: 'var(--primary)', letterSpacing: '-1px' }}>Quản lý nhân sự</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '16px' }}>Kiểm soát tài khoản nhân viên, phân quyền vị trí và phòng ban.</p>
        </div>
        <button onClick={() => handleOpenModal()} className="btn-premium">
          <i className="fas fa-user-plus"></i> Khởi tạo tài khoản
        </button>
      </div>

      <div className="premium-table-container">
        <table>
          <thead>
            <tr>
              <th>Nhân viên</th>
              <th>Phân quyền</th>
              <th>Bộ phận</th>
              <th>Vị trí</th>
              <th>Trạng thái</th>
              <th style={{ textAlign: 'center' }}>Tác vụ</th>
            </tr>
          </thead>
          <tbody>
            {employees.slice(0, visibleCount).map((emp) => (
              <tr key={emp.id} className="table-row">
                <td>
                   <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                      <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'var(--gold-gradient)', color: 'var(--black)', display: 'flex', justifyContent: 'center', alignItems: 'center', fontWeight: '900' }}>
                         {(emp.first_name || emp.full_name || 'E')[0]}
                      </div>
                      <div>
                         <div style={{ fontWeight: '700', color: 'var(--primary)' }}>{emp.full_name || `${emp.first_name || ''} ${emp.last_name || ''}`}</div>
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
            {isScrollingLoading && (
              Array.from({ length: 3 }).map((_, idx) => (
                <tr key={idx} className="table-row">
                  <td>
                     <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                        <div className="skeleton-pulse" style={{ width: '40px', height: '40px', borderRadius: '50%' }}></div>
                        <div>
                           <div className="skeleton-pulse" style={{ width: '120px', height: '14px', marginBottom: '8px' }}></div>
                           <div className="skeleton-pulse" style={{ width: '150px', height: '12px' }}></div>
                        </div>
                     </div>
                  </td>
                  <td><div className="skeleton-pulse" style={{ width: '60px', height: '14px', borderRadius: '50px' }}></div></td>
                  <td><div className="skeleton-pulse" style={{ width: '90px', height: '14px' }}></div></td>
                  <td><div className="skeleton-pulse" style={{ width: '80px', height: '14px' }}></div></td>
                  <td><div className="skeleton-pulse" style={{ width: '100px', height: '22px', borderRadius: '50px' }}></div></td>
                  <td style={{ textAlign: 'center' }}>
                     <div style={{ display: 'flex', justifyContent: 'center' }}><div className="skeleton-pulse" style={{ width: '20px', height: '20px' }}></div></div>
                  </td>
                </tr>
              ))
            )}
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
                   <input required value={formData.department} onChange={e => setFormData({...formData, department: e.target.value})} style={{ width: '100%', padding: '12px', borderRadius: '10px', border: '1px solid #ddd' }} />
                </div>
                <div>
                   <label className="luxury-label">Vị trí</label>
                   <input required value={formData.position} onChange={e => setFormData({...formData, position: e.target.value})} style={{ width: '100%', padding: '12px', borderRadius: '10px', border: '1px solid #ddd' }} />
                </div>
                <div>
                   <label className="luxury-label">Vai trò phân quyền</label>
                   <select value={formData.role} onChange={e => setFormData({...formData, role: e.target.value})} style={{ width: '100%', padding: '12px', borderRadius: '10px', border: '1px solid #ddd' }}>
                     <option value="STAFF">STAFF</option>
                     <option value="ADMIN">ADMIN</option>
                   </select>
                </div>
                {editingEmp && (
                  <div>
                     <label className="luxury-label">Trạng thái tài khoản</label>
                     <select value={formData.status} onChange={e => setFormData({...formData, status: e.target.value})} style={{ width: '100%', padding: '12px', borderRadius: '10px', border: '1px solid #ddd' }}>
                       <option value="ACTIVE">ACTIVE</option>
                       <option value="INACTIVE">INACTIVE</option>
                     </select>
                  </div>
                )}
            </div>
            
            <div style={{ display: 'flex', gap: '15px', marginTop: '40px', justifyContent: 'flex-end' }}>
               <button type="button" onClick={() => setShowModal(false)} className="btn-premium" style={{ background: '#fff', border: '1px solid var(--primary)', color: 'var(--primary)' }}>Đóng</button>
               <button type="submit" className="btn-premium">Lưu thông tin</button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
