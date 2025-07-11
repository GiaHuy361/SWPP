import { useMemo, useState, useEffect } from 'react';
import communicationApi from 'api/communicationApi';

const ProgramComponent = ({ programId }) => {
  const [program, setProgram] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [participationStatus, setParticipationStatus] = useState({ isParticipating: false, canJoin: true });

  const isRegistrationOpen = useMemo(() => {
    if (!program) return false;
    
    const now = new Date();
    const startDate = new Date(program.startDate);
    const endDate = new Date(program.endDate);
    
    // Kiểm tra chương trình có đang mở đăng ký không
    // Có thể đăng ký nếu chưa bắt đầu hoặc đang diễn ra
    return now <= endDate && program.status === 'ACTIVE';
  }, [program]);

  const programStatus = useMemo(() => {
    if (!program) return 'UNKNOWN';
    
    const now = new Date();
    const startDate = new Date(program.startDate);
    const endDate = new Date(program.endDate);
    
    if (now < startDate) return 'UPCOMING';
    if (now > endDate) return 'COMPLETED';
    return 'ACTIVE';
  }, [program]);

  const fetchProgramDetails = async () => {
    try {
      setLoading(true);
      
      // Fetch program details
      const programResponse = await communicationApi.getProgramById(programId);
      setProgram(programResponse);
      
      // Không gọi getParticipationStatus vì API không tồn tại
      // Mặc định là chưa tham gia
      setParticipationStatus({ isParticipating: false, canJoin: true });
      
    } catch (error) {
      console.error('Error fetching program:', error);
      setError('Không thể tải thông tin chương trình');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProgramDetails();
  }, [programId]);

  const handleJoinProgram = async () => {
    // Logic to handle joining the program
  };

  const handleLeaveProgram = async () => {
    // Logic to handle leaving the program
  };

  if (loading) return <p>Loading...</p>;
  if (error) return <p>{error}</p>;

  return (
    <div>
      <h1>Program Details</h1>
      <p>Status: {programStatus}</p>
      <p>Registration Open: {isRegistrationOpen ? 'Yes' : 'No'}</p>
      
      {/* Participation Section */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Tham gia chương trình</h3>
        
        {programStatus === 'COMPLETED' ? (
          <div className="text-center py-4">
            <div className="text-gray-500 mb-2">Chương trình đã kết thúc</div>
            <div className="text-sm text-gray-400">
              Kết thúc: {new Date(program.endDate).toLocaleDateString('vi-VN')}
            </div>
          </div>
        ) : programStatus === 'UPCOMING' ? (
          <div className="text-center py-4">
            <div className="text-blue-600 mb-2">Chương trình sắp bắt đầu</div>
            <div className="text-sm text-gray-500 mb-4">
              Bắt đầu: {new Date(program.startDate).toLocaleDateString('vi-VN')}
            </div>
            <button
              onClick={handleJoinProgram}
              disabled={participationStatus.isParticipating || loading}
              className={`px-6 py-2 rounded-lg font-medium transition-colors ${
                participationStatus.isParticipating
                  ? 'bg-green-100 text-green-800 cursor-not-allowed'
                  : 'bg-blue-600 text-white hover:bg-blue-700'
              }`}
            >
              {participationStatus.isParticipating ? 'Đã đăng ký' : 'Đăng ký tham gia'}
            </button>
          </div>
        ) : (
          <div className="text-center py-4">
            <div className="text-green-600 mb-2">Chương trình đang diễn ra</div>
            <div className="text-sm text-gray-500 mb-4">
              Ngày đăng ký: {participationStatus.isParticipating ? 'Đã đăng ký' : 'Chưa đăng ký'}
            </div>
            <button
              onClick={participationStatus.isParticipating ? handleLeaveProgram : handleJoinProgram}
              disabled={loading}
              className={`px-6 py-2 rounded-lg font-medium transition-colors ${
                participationStatus.isParticipating
                  ? 'bg-red-600 text-white hover:bg-red-700'
                  : 'bg-blue-600 text-white hover:bg-blue-700'
              }`}
            >
              {participationStatus.isParticipating ? 'Rời khỏi chương trình' : 'Tham gia ngay'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProgramComponent;