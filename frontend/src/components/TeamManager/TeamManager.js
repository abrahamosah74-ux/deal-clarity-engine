// frontend/src/components/TeamManager/TeamManager.js
import React, { useState, useEffect } from 'react';
import { FiUsers, FiPlus, FiSettings, FiLogOut, FiChevronDown } from 'react-icons/fi';
import { api } from '../../services/api';
import CreateTeamModal from './CreateTeamModal';
import TeamSettingsModal from './TeamSettingsModal';
import InviteMembersModal from './InviteMembersModal';
import './TeamManager.css';

const TeamManager = ({ currentTeam, onTeamChange }) => {
  const [teams, setTeams] = useState([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [selectedTeam, setSelectedTeam] = useState(null);
  const [teamStats, setTeamStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchTeams();
  }, []);

  useEffect(() => {
    if (currentTeam) {
      fetchTeamStats(currentTeam._id);
    }
  }, [currentTeam]);

  const fetchTeams = async () => {
    try {
      setLoading(true);
      const response = await api.get('/teams');
      setTeams(response.data.teams);
      
      // Set first team as selected if not already
      if (response.data.teams.length > 0 && !selectedTeam) {
        setSelectedTeam(response.data.teams[0]);
      }
      setError(null);
    } catch (err) {
      setError('Failed to load teams');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchTeamStats = async (teamId) => {
    try {
      const response = await api.get(`/teams/${teamId}/stats`);
      setTeamStats(response.data.stats);
    } catch (err) {
      console.error('Failed to fetch team stats:', err);
    }
  };

  const handleSwitchTeam = async (team) => {
    try {
      await api.post(`/teams/${team._id}/switch`);
      setSelectedTeam(team);
      onTeamChange(team);
    } catch (err) {
      setError('Failed to switch team');
      console.error(err);
    }
  };

  const handleCreateTeam = async (teamData) => {
    try {
      await api.post('/teams', teamData);
      setShowCreateModal(false);
      fetchTeams();
    } catch (err) {
      setError('Failed to create team');
      console.error(err);
    }
  };

  const handleUpdateTeam = async (teamData) => {
    try {
      await api.put(`/teams/${selectedTeam._id}`, teamData);
      setShowSettingsModal(false);
      fetchTeams();
      setSelectedTeam({ ...selectedTeam, ...teamData });
    } catch (err) {
      setError('Failed to update team');
      console.error(err);
    }
  };

  const handleInviteMembers = async (invites) => {
    try {
      for (const invite of invites) {
        await api.post(`/teams/${selectedTeam._id}/invite`, {
          email: invite.email,
          role: invite.role
        });
      }
      setShowInviteModal(false);
      fetchTeams();
    } catch (err) {
      setError('Failed to send invites');
      console.error(err);
    }
  };

  if (loading) {
    return <div className="team-manager loading">Loading teams...</div>;
  }

  return (
    <div className="team-manager">
      <div className="team-selector">
        <div className="team-header">
          <FiUsers className="team-icon" />
          <h3>Teams</h3>
        </div>

        <div className="teams-list">
          {teams.map(team => (
            <div
              key={team._id}
              className={`team-item ${selectedTeam?._id === team._id ? 'active' : ''}`}
              onClick={() => handleSwitchTeam(team)}
            >
              <div className="team-item-name">{team.name}</div>
              <div className="team-item-members">{team.members.length} members</div>
            </div>
          ))}
        </div>

        <button
          className="btn-create-team"
          onClick={() => setShowCreateModal(true)}
        >
          <FiPlus /> New Team
        </button>
      </div>

      {selectedTeam && (
        <div className="team-details">
          <div className="team-info">
            <h2>{selectedTeam.name}</h2>
            {selectedTeam.description && (
              <p className="team-description">{selectedTeam.description}</p>
            )}
          </div>

          {teamStats && (
            <div className="team-stats">
              <div className="stat-box">
                <div className="stat-value">{teamStats.totalDeals}</div>
                <div className="stat-label">Deals</div>
              </div>
              <div className="stat-box">
                <div className="stat-value">${(teamStats.totalDealValue / 1000).toFixed(1)}k</div>
                <div className="stat-label">Pipeline Value</div>
              </div>
              <div className="stat-box">
                <div className="stat-value">{teamStats.totalContacts}</div>
                <div className="stat-label">Contacts</div>
              </div>
              <div className="stat-box">
                <div className="stat-value">{teamStats.activeTasks}</div>
                <div className="stat-label">Active Tasks</div>
              </div>
            </div>
          )}

          <div className="team-members">
            <h3>Team Members ({selectedTeam.members.length})</h3>
            <div className="members-list">
              {selectedTeam.members.map(member => (
                <div key={member._id} className="member-item">
                  <div className="member-info">
                    <div className="member-name">{member.user?.name}</div>
                    <div className="member-email">{member.user?.email}</div>
                  </div>
                  <div className={`member-role ${member.role}`}>{member.role}</div>
                </div>
              ))}
            </div>
            <button
              className="btn-invite"
              onClick={() => setShowInviteModal(true)}
            >
              <FiPlus /> Invite Member
            </button>
          </div>

          <div className="team-actions">
            <button
              className="btn-settings"
              onClick={() => setShowSettingsModal(true)}
            >
              <FiSettings /> Team Settings
            </button>
          </div>
        </div>
      )}

      {error && <div className="error-message">{error}</div>}

      <CreateTeamModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSubmit={handleCreateTeam}
      />

      {selectedTeam && (
        <>
          <TeamSettingsModal
            isOpen={showSettingsModal}
            onClose={() => setShowSettingsModal(false)}
            team={selectedTeam}
            onSubmit={handleUpdateTeam}
          />

          <InviteMembersModal
            isOpen={showInviteModal}
            onClose={() => setShowInviteModal(false)}
            onSubmit={handleInviteMembers}
          />
        </>
      )}
    </div>
  );
};

export default TeamManager;
