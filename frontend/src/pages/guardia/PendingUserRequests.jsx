import { useEffect, useState } from 'react';
import { ReviewService } from '@services/review.service.js';

export default function PendingUserRequests() {
    const [pendingUsers, setPendingUsers] = useState([]);
    const [error, setError] = useState('');

    useEffect(() => {
        loadPendingUsers();
    }, []);

    const loadPendingUsers = async () => {
        try {
            const res = await ReviewService.getPending();
            setPendingUsers(res.data);
        } catch (err) {
            setError(err.message);
        }
    };

    const handleApprove = async (id) => {
        try {
            await reviewService.approveUser(id);
            loadPendingUsers();
        } catch (err) {
            alert(err.message);
        }
    };

    const handleReject = async (id) => {
        const comment = prompt('Rejection reason');
        if (!comment) return;

        try {
            await ReviewService.rejectUser(id, comment);
            loadPendingUsers();
        } catch (err) {
            alert(err.message);
        }
    };

    return (
        <div>
            <h2>Pending User Requests</h2>

            {error && <p style={{ color: 'red' }}>⚠️ {error}</p>}

            {pendingUsers.map((user) => (
                <div key={user.id}>
                    <span>{user.email}</span>
                    <button onClick={() => handleApprove(user.id)}>Approve</button>
                    <button onClick={() => handleReject(user.id)}>Reject</button>
                </div>
            ))}
        </div>
    );
}
