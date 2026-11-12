import React, { useState, useEffect } from 'react';
import {
  X,
  Satellite,
  Globe,
  Flame,
  Activity,
  Key,
  ExternalLink,
  RefreshCw,
  AlertTriangle,
  Compass,
  CheckCircle2,
  HelpCircle,
  Eye,
  Radio,
  Clock,
  Sparkles,
  BookOpen
} from 'lucide-react';
import {
  fetchNasaApod,
  fetchNearEarthAsteroids,
  fetchLiveIssPosition,
  fetchMarsWeather,
  getNasaApiKey,
  setNasaApiKey,
  getEarthVitalSigns,
  SATELLITE_CATALOG,
  type NasaApodData,
  type NearEarthObject,
  type LiveIssPosition,
  type MarsWeatherReport,
  type EarthVitalSign,
  type EarthSatelliteData,
} from '../services/nasaApiService';
import { soundFx } from '../utils/audioEffects';

export interface NasaLiveObservatoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectSatellite?: (satelliteId: string) => void;
}

export const NasaLiveObservatoryModal: React.FC<NasaLiveObservatoryModalProps> = ({
  isOpen,
  onClose,
  onSelectSatellite,
}) => {
  const [activeTab, setActiveTab] = useState<'satellites' | 'earthdata' | 'apod' | 'neows' | 'mars' | 'apikeys'>('satellites');
  
  // Data States
  const [apodData, setApodData] = useState<NasaApodData | null>(null);
  const [neowsList, setNeowsList] = useState<NearEarthObject[]>([]);
  const [issPosition, setIssPosition] = useState<LiveIssPosition | null>(null);
  const [marsWeather, setMarsWeather] = useState<MarsWeatherReport | null>(null);
  const [vitalSigns, setVitalSigns] = useState<EarthVitalSign[]>([]);
  const [selectedSat, setSelectedSat] = useState<EarthSatelliteData>(SATELLITE_CATALOG[0]);
  
  // API Key State
  const [customKeyInput, setCustomKeyInput] = useState<string>('');
  const [activeKey, setActiveKey] = useState<string>('DEMO_KEY');
  const [keySavedToast, setKeySavedToast] = useState<boolean>(false);
  
  // Loading & Error States
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [lastRefreshed, setLastRefreshed] = useState<string>('');

  useEffect(() => {
    if (!isOpen) return;

    setActiveKey(getNasaApiKey());
    setVitalSigns(getEarthVitalSigns());
    loadAllNasaFeeds();

    // Set up a 15-second live telemetry poll for ISS
    const interval = setInterval(() => {
      fetchLiveIssPosition().then(setIssPosition).catch(() => {});
    }, 15000);

    return () => clearInterval(interval);
  }, [isOpen]);

  const loadAllNasaFeeds = async () => {
    setIsLoading(true);
    try {
      const [apod, neos, iss, mars] = await Promise.all([
        fetchNasaApod(),
        fetchNearEarthAsteroids(),
        fetchLiveIssPosition(),
        fetchMarsWeather(),
      ]);
      setApodData(apod);
      setNeowsList(neos);
      setIssPosition(iss);
      setMarsWeather(mars);
      setLastRefreshed(new Date().toLocaleTimeString());
    } catch (err) {
      console.error('Error loading NASA feeds:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveApiKey = () => {
    setNasaApiKey(customKeyInput);
    setActiveKey(getNasaApiKey());
    setKeySavedToast(true);
    soundFx.playSuccess();
    setTimeout(() => setKeySavedToast(false), 3000);
    loadAllNasaFeeds();
  };

  if (!isOpen) return null;

  return (
    <div
      className="nasa-modal-overlay"
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9999,
        background: 'rgba(2, 6, 23, 0.85)',
        backdropFilter: 'blur(10px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '16px',
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          soundFx.playClick(600);
          onClose();
        }
      }}
    >
      <div
        className="nasa-live-modal-dialog"
        style={{
          width: '100%',
          maxWidth: '1050px',
          maxHeight: '90vh',
          background: 'linear-gradient(180deg, #091024 0%, #030712 100%)',
          border: '1.5px solid rgba(56, 189, 248, 0.4)',
          borderRadius: '16px',
          boxShadow: '0 25px 60px -15px rgba(0, 0, 0, 0.9), 0 0 35px rgba(56, 189, 248, 0.25)',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          color: '#f8fafc',
          fontFamily: 'system-ui, -apple-system, sans-serif',
        }}
      >
        {/* MODAL HEADER */}
        <header
          style={{
            padding: '18px 24px',
            borderBottom: '1px solid rgba(56, 189, 248, 0.2)',
            background: 'rgba(15, 23, 42, 0.75)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '12px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div
              style={{
                width: '38px',
                height: '38px',
                borderRadius: '10px',
                background: 'linear-gradient(135deg, rgba(56, 189, 248, 0.3), rgba(249, 115, 22, 0.2))',
                border: '1px solid rgba(56, 189, 248, 0.5)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#38bdf8',
              }}
            >
              <Radio size={20} className="pulse-anim" />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 800, letterSpacing: '0.02em', color: '#ffffff' }}>
                  NASA Open Data &amp; Satellite Observatory
                </h3>
                <span
                  style={{
                    fontSize: '10px',
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    padding: '2px 8px',
                    borderRadius: '12px',
                    background: 'rgba(34, 197, 94, 0.2)',
                    border: '1px solid rgba(34, 197, 94, 0.5)',
                    color: '#4ade80',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                  }}
                >
                  <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#4ade80' }} />
                  NASA APIs Connected
                </span>
              </div>
              <p style={{ margin: '3px 0 0 0', fontSize: '12px', color: '#94a3b8' }}>
                Authentic telemetry from <strong>data.nasa.gov</strong>, <strong>api.nasa.gov</strong>, and <strong>earthdata.nasa.gov</strong>
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <button
              onClick={() => {
                soundFx.playClick(900);
                loadAllNasaFeeds();
              }}
              title="Refresh all real-time NASA feeds"
              style={{
                padding: '7px 12px',
                background: 'rgba(30, 41, 59, 0.8)',
                border: '1px solid rgba(148, 163, 184, 0.3)',
                borderRadius: '8px',
                color: '#cbd5e1',
                fontSize: '12px',
                fontWeight: 600,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                transition: 'all 0.2s',
              }}
            >
              <RefreshCw size={14} className={isLoading ? 'spin-anim' : ''} />
              <span>Refresh</span>
            </button>

            <button
              onClick={() => {
                soundFx.playClick(600);
                onClose();
              }}
              title="Close Live Observatory"
              style={{
                width: '34px',
                height: '34px',
                borderRadius: '8px',
                background: 'rgba(239, 68, 68, 0.15)',
                border: '1px solid rgba(239, 68, 68, 0.4)',
                color: '#f87171',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <X size={18} />
            </button>
          </div>
        </header>

        {/* TAB NAVIGATION STRIP */}
        <nav
          style={{
            display: 'flex',
            padding: '0 24px',
            background: 'rgba(15, 23, 42, 0.95)',
            borderBottom: '1px solid rgba(56, 189, 248, 0.15)',
            overflowX: 'auto',
            gap: '6px',
          }}
        >
          <button
            onClick={() => { setActiveTab('satellites'); soundFx.playClick(750); }}
            style={{
              padding: '12px 16px',
              border: 'none',
              background: 'transparent',
              color: activeTab === 'satellites' ? '#38bdf8' : '#94a3b8',
              borderBottom: activeTab === 'satellites' ? '2.5px solid #38bdf8' : '2.5px solid transparent',
              fontSize: '13px',
              fontWeight: 700,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              whiteSpace: 'nowrap',
            }}
          >
            <Satellite size={16} />
            <span>Earth Satellites &amp; ISS ({SATELLITE_CATALOG.length})</span>
          </button>

          <button
            onClick={() => { setActiveTab('earthdata'); soundFx.playClick(750); }}
            style={{
              padding: '12px 16px',
              border: 'none',
              background: 'transparent',
              color: activeTab === 'earthdata' ? '#38bdf8' : '#94a3b8',
              borderBottom: activeTab === 'earthdata' ? '2.5px solid #38bdf8' : '2.5px solid transparent',
              fontSize: '13px',
              fontWeight: 700,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              whiteSpace: 'nowrap',
            }}
          >
            <Globe size={16} />
            <span>NASA Earthdata Vital Signs</span>
          </button>

          <button
            onClick={() => { setActiveTab('apod'); soundFx.playClick(750); }}
            style={{
              padding: '12px 16px',
              border: 'none',
              background: 'transparent',
              color: activeTab === 'apod' ? '#38bdf8' : '#94a3b8',
              borderBottom: activeTab === 'apod' ? '2.5px solid #38bdf8' : '2.5px solid transparent',
              fontSize: '13px',
              fontWeight: 700,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              whiteSpace: 'nowrap',
            }}
          >
            <Sparkles size={16} />
            <span>NASA APOD Daily Image</span>
          </button>

          <button
            onClick={() => { setActiveTab('neows'); soundFx.playClick(750); }}
            style={{
              padding: '12px 16px',
              border: 'none',
              background: 'transparent',
              color: activeTab === 'neows' ? '#38bdf8' : '#94a3b8',
              borderBottom: activeTab === 'neows' ? '2.5px solid #38bdf8' : '2.5px solid transparent',
              fontSize: '13px',
              fontWeight: 700,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              whiteSpace: 'nowrap',
            }}
          >
            <Activity size={16} />
            <span>Near-Earth Asteroid Radar ({neowsList.length})</span>
          </button>

          <button
            onClick={() => { setActiveTab('mars'); soundFx.playClick(750); }}
            style={{
              padding: '12px 16px',
              border: 'none',
              background: 'transparent',
              color: activeTab === 'mars' ? '#38bdf8' : '#94a3b8',
              borderBottom: activeTab === 'mars' ? '2.5px solid #38bdf8' : '2.5px solid transparent',
              fontSize: '13px',
              fontWeight: 700,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              whiteSpace: 'nowrap',
            }}
          >
            <Flame size={16} />
            <span>Mars Surface Telemetry</span>
          </button>

          <button
            onClick={() => { setActiveTab('apikeys'); soundFx.playClick(750); }}
            style={{
              padding: '12px 16px',
              border: 'none',
              background: 'transparent',
              color: activeTab === 'apikeys' ? '#38bdf8' : '#94a3b8',
              borderBottom: activeTab === 'apikeys' ? '2.5px solid #38bdf8' : '2.5px solid transparent',
              fontSize: '13px',
              fontWeight: 700,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              whiteSpace: 'nowrap',
            }}
          >
            <Key size={16} />
            <span>NASA API Key Manager</span>
          </button>
        </nav>

        {/* TAB BODY AREA */}
        <div
          style={{
            flex: 1,
            overflowY: 'auto',
            padding: '24px',
            background: 'rgba(3, 7, 18, 0.6)',
          }}
        >
          {/* TAB 1: SATELLITES & ISS LIVE TRACKER */}
          {activeTab === 'satellites' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              {/* LIVE ISS HERO CARD */}
              <div
                style={{
                  background: 'linear-gradient(135deg, rgba(14, 165, 233, 0.15) 0%, rgba(30, 58, 138, 0.25) 100%)',
                  border: '1px solid rgba(56, 189, 248, 0.4)',
                  borderRadius: '12px',
                  padding: '18px 22px',
                  display: 'flex',
                  flexWrap: 'wrap',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: '16px',
                }}
              >
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#38bdf8', boxShadow: '0 0 10px #38bdf8' }} />
                    <span style={{ fontSize: '11px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#38bdf8' }}>
                      Live Open Satellite Telemetry
                    </span>
                  </div>
                  <h4 style={{ margin: '4px 0 2px 0', fontSize: '18px', color: '#ffffff', fontWeight: 800 }}>
                    International Space Station (ISS) Live Position
                  </h4>
                  <p style={{ margin: 0, fontSize: '12px', color: '#94a3b8' }}>
                    Tracking live sub-satellite point across Earth’s geographic coordinates.
                  </p>
                </div>

                {issPosition ? (
                  <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
                    <div style={{ background: 'rgba(2, 6, 23, 0.6)', padding: '8px 14px', borderRadius: '8px', border: '1px solid rgba(56, 189, 248, 0.2)' }}>
                      <span style={{ fontSize: '10px', color: '#94a3b8', display: 'block' }}>Latitude</span>
                      <strong style={{ fontSize: '15px', color: '#38bdf8', fontFamily: 'monospace' }}>
                        {issPosition.latitude >= 0 ? `${issPosition.latitude}° N` : `${Math.abs(issPosition.latitude)}° S`}
                      </strong>
                    </div>

                    <div style={{ background: 'rgba(2, 6, 23, 0.6)', padding: '8px 14px', borderRadius: '8px', border: '1px solid rgba(56, 189, 248, 0.2)' }}>
                      <span style={{ fontSize: '10px', color: '#94a3b8', display: 'block' }}>Longitude</span>
                      <strong style={{ fontSize: '15px', color: '#38bdf8', fontFamily: 'monospace' }}>
                        {issPosition.longitude >= 0 ? `${issPosition.longitude}° E` : `${Math.abs(issPosition.longitude)}° W`}
                      </strong>
                    </div>

                    <div style={{ background: 'rgba(2, 6, 23, 0.6)', padding: '8px 14px', borderRadius: '8px', border: '1px solid rgba(56, 189, 248, 0.2)' }}>
                      <span style={{ fontSize: '10px', color: '#94a3b8', display: 'block' }}>Orbital Speed</span>
                      <strong style={{ fontSize: '15px', color: '#4ade80', fontFamily: 'monospace' }}>
                        {issPosition.velocityKmh.toLocaleString()} km/h
                      </strong>
                    </div>

                    <div style={{ background: 'rgba(2, 6, 23, 0.6)', padding: '8px 14px', borderRadius: '8px', border: '1px solid rgba(56, 189, 248, 0.2)' }}>
                      <span style={{ fontSize: '10px', color: '#94a3b8', display: 'block' }}>Altitude</span>
                      <strong style={{ fontSize: '15px', color: '#f59e0b', fontFamily: 'monospace' }}>
                        {issPosition.altitudeKm} km
                      </strong>
                    </div>
                  </div>
                ) : (
                  <span style={{ fontSize: '12px', color: '#94a3b8' }}>Acquiring satellite lock...</span>
                )}
              </div>

              {/* SATELLITE ROSTER SPLIT VIEW */}
              <div style={{ display: 'grid', gridTemplateColumns: 'minmax(280px, 340px) 1fr', gap: '20px' }}>
                {/* Left: Satellite List */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <div style={{ fontSize: '12px', fontWeight: 700, color: '#38bdf8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    Select Satellite To Inspect:
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', maxHeight: '420px', overflowY: 'auto', paddingRight: '4px' }}>
                    {SATELLITE_CATALOG.map((sat) => {
                      const isSelected = selectedSat.id === sat.id;
                      return (
                        <div
                          key={sat.id}
                          onClick={() => {
                            setSelectedSat(sat);
                            soundFx.playClick(800);
                          }}
                          style={{
                            padding: '10px 14px',
                            borderRadius: '10px',
                            background: isSelected ? 'rgba(14, 165, 233, 0.2)' : 'rgba(15, 23, 42, 0.6)',
                            border: isSelected ? '1.5px solid #38bdf8' : '1px solid rgba(148, 163, 184, 0.15)',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            transition: 'all 0.15s ease',
                          }}
                        >
                          <div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                              <span style={{ fontSize: '14px' }}>🛰️</span>
                              <strong style={{ fontSize: '13px', color: isSelected ? '#ffffff' : '#e2e8f0' }}>
                                {sat.name}
                              </strong>
                            </div>
                            <span style={{ fontSize: '11px', color: '#94a3b8' }}>
                              {sat.agency.split('/')[0]} • {sat.orbitType.split(' ')[0]} ({sat.altitudeKm} km)
                            </span>
                          </div>

                          {onSelectSatellite && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                soundFx.playSuccess();
                                onSelectSatellite(sat.id);
                                onClose();
                              }}
                              title="Fly to this satellite in 3D Solar System"
                              style={{
                                padding: '4px 8px',
                                background: 'rgba(56, 189, 248, 0.25)',
                                border: '1px solid rgba(56, 189, 248, 0.6)',
                                borderRadius: '6px',
                                color: '#38bdf8',
                                fontSize: '10.5px',
                                fontWeight: 700,
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '4px',
                              }}
                            >
                              <Eye size={12} />
                              <span>View 3D</span>
                            </button>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Right: Selected Satellite Detailed Dossier */}
                <div
                  style={{
                    background: 'rgba(15, 23, 42, 0.75)',
                    border: '1px solid rgba(56, 189, 248, 0.25)',
                    borderRadius: '12px',
                    padding: '20px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '16px',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '10px' }}>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ fontSize: '11px', color: '#38bdf8', fontFamily: 'monospace', fontWeight: 700 }}>
                          {selectedSat.callsign}
                        </span>
                        <span style={{ fontSize: '10px', padding: '1px 6px', borderRadius: '4px', background: 'rgba(56, 189, 248, 0.15)', color: '#7dd3fc' }}>
                          Launched {selectedSat.launchYear}
                        </span>
                      </div>
                      <h3 style={{ margin: '4px 0 0 0', fontSize: '20px', color: '#ffffff', fontWeight: 800 }}>
                        {selectedSat.name}
                      </h3>
                      <p style={{ margin: '2px 0 0 0', fontSize: '12px', color: '#94a3b8' }}>
                        {selectedSat.agency}
                      </p>
                    </div>

                    {onSelectSatellite && (
                      <button
                        onClick={() => {
                          soundFx.playSuccess();
                          onSelectSatellite(selectedSat.id);
                          onClose();
                        }}
                        style={{
                          padding: '8px 16px',
                          background: 'linear-gradient(135deg, #0284c7, #0369a1)',
                          border: 'none',
                          borderRadius: '8px',
                          color: '#ffffff',
                          fontSize: '12px',
                          fontWeight: 700,
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px',
                          boxShadow: '0 4px 12px rgba(2, 132, 199, 0.4)',
                        }}
                      >
                        <Compass size={14} />
                        <span>Lock Target in 3D Orrery</span>
                      </button>
                    )}
                  </div>

                  {/* Overview Text */}
                  <div style={{ background: 'rgba(2, 6, 23, 0.6)', padding: '14px', borderRadius: '10px', border: '1px solid rgba(148, 163, 184, 0.1)' }}>
                    <div style={{ fontSize: '11px', color: '#38bdf8', fontWeight: 700, textTransform: 'uppercase', marginBottom: '4px' }}>
                      🛰️ Mission &amp; Purpose in Space
                    </div>
                    <p style={{ margin: 0, fontSize: '13px', lineHeight: 1.5, color: '#e2e8f0' }}>
                      {selectedSat.description}
                    </p>
                  </div>

                  {/* What it Does for Earth */}
                  <div style={{ background: 'rgba(16, 185, 129, 0.1)', padding: '14px', borderRadius: '10px', border: '1px solid rgba(16, 185, 129, 0.3)' }}>
                    <div style={{ fontSize: '11px', color: '#34d399', fontWeight: 700, textTransform: 'uppercase', marginBottom: '4px' }}>
                      🌍 How This Satellite Helps People on Earth
                    </div>
                    <p style={{ margin: 0, fontSize: '13px', lineHeight: 1.5, color: '#d1fae5' }}>
                      {selectedSat.whatItDoesForEarth}
                    </p>
                  </div>

                  {/* Telemetry Strip */}
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '10px' }}>
                    <div style={{ background: 'rgba(2, 6, 23, 0.7)', padding: '8px 10px', borderRadius: '8px' }}>
                      <span style={{ fontSize: '10px', color: '#94a3b8', display: 'block' }}>Orbit Type</span>
                      <strong style={{ fontSize: '12px', color: '#ffffff' }}>{selectedSat.orbitType.split(' ')[0]}</strong>
                    </div>
                    <div style={{ background: 'rgba(2, 6, 23, 0.7)', padding: '8px 10px', borderRadius: '8px' }}>
                      <span style={{ fontSize: '10px', color: '#94a3b8', display: 'block' }}>Altitude</span>
                      <strong style={{ fontSize: '12px', color: '#38bdf8' }}>{selectedSat.altitudeKm.toLocaleString()} km</strong>
                    </div>
                    <div style={{ background: 'rgba(2, 6, 23, 0.7)', padding: '8px 10px', borderRadius: '8px' }}>
                      <span style={{ fontSize: '10px', color: '#94a3b8', display: 'block' }}>Speed</span>
                      <strong style={{ fontSize: '12px', color: '#4ade80' }}>{selectedSat.velocityKms} km/s</strong>
                    </div>
                    <div style={{ background: 'rgba(2, 6, 23, 0.7)', padding: '8px 10px', borderRadius: '8px' }}>
                      <span style={{ fontSize: '10px', color: '#94a3b8', display: 'block' }}>Period</span>
                      <strong style={{ fontSize: '12px', color: '#f59e0b' }}>{selectedSat.orbitalPeriodMin} min</strong>
                    </div>
                  </div>

                  {/* Scientific Instruments */}
                  <div>
                    <div style={{ fontSize: '12px', fontWeight: 700, color: '#38bdf8', marginBottom: '8px', textTransform: 'uppercase' }}>
                      Scientific Sensor Payload:
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                      {selectedSat.nasaInstruments.map((inst, idx) => (
                        <div
                          key={idx}
                          style={{
                            background: 'rgba(2, 6, 23, 0.5)',
                            padding: '8px 12px',
                            borderRadius: '8px',
                            borderLeft: '3px solid #38bdf8',
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            gap: '12px',
                          }}
                        >
                          <div>
                            <strong style={{ fontSize: '12px', color: '#ffffff' }}>{inst.acronym}</strong>
                            <span style={{ fontSize: '11px', color: '#94a3b8', marginLeft: '6px' }}>({inst.name})</span>
                            <div style={{ fontSize: '11px', color: '#cbd5e1', marginTop: '2px' }}>{inst.purpose}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* NASA Space Place Article & Quiz */}
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: '10px', borderTop: '1px solid rgba(148, 163, 184, 0.15)' }}>
                    <a
                      href={selectedSat.spacePlaceArticle.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        color: '#38bdf8',
                        fontSize: '12px',
                        textDecoration: 'none',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                      }}
                    >
                      <BookOpen size={14} />
                      <span>Learn more on NASA Space Place</span>
                      <ExternalLink size={12} />
                    </a>

                    <span style={{ fontSize: '11px', color: '#94a3b8' }}>
                      Source: <strong>earthdata.nasa.gov</strong>
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: NASA EARTHDATA VITAL SIGNS */}
          {activeTab === 'earthdata' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div
                style={{
                  background: 'rgba(15, 23, 42, 0.7)',
                  border: '1px solid rgba(56, 189, 248, 0.25)',
                  borderRadius: '12px',
                  padding: '16px 20px',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Globe size={18} style={{ color: '#38bdf8' }} />
                  <h4 style={{ margin: 0, fontSize: '16px', color: '#ffffff', fontWeight: 800 }}>
                    Vital Signs of the Planet (NASA Earthdata)
                  </h4>
                </div>
                <p style={{ margin: '6px 0 0 0', fontSize: '12.5px', color: '#94a3b8', lineHeight: 1.5 }}>
                  NASA’s fleet of Earth-observing satellites continuously monitors our planet’s vital signs: temperature, ice sheets, sea levels, and atmosphere. Explore real scientific measurements from <strong>earthdata.nasa.gov</strong>.
                </p>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '16px' }}>
                {vitalSigns.map((sign) => (
                  <div
                    key={sign.id}
                    style={{
                      background: 'rgba(15, 23, 42, 0.75)',
                      border: '1px solid rgba(56, 189, 248, 0.2)',
                      borderRadius: '12px',
                      padding: '18px',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'space-between',
                      gap: '12px',
                    }}
                  >
                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <span
                          style={{
                            fontSize: '10px',
                            fontWeight: 700,
                            padding: '2px 8px',
                            borderRadius: '4px',
                            background: sign.trend === 'up' ? 'rgba(239, 68, 68, 0.2)' : 'rgba(59, 130, 246, 0.2)',
                            color: sign.trend === 'up' ? '#f87171' : '#60a5fa',
                            textTransform: 'uppercase',
                          }}
                        >
                          {sign.category}
                        </span>
                        <span style={{ fontSize: '11px', color: '#94a3b8', fontFamily: 'monospace' }}>
                          {sign.changeRate}
                        </span>
                      </div>

                      <h4 style={{ margin: '8px 0 2px 0', fontSize: '15px', color: '#ffffff', fontWeight: 700 }}>
                        {sign.metric}
                      </h4>
                      <div style={{ fontSize: '24px', fontWeight: 800, color: '#38bdf8', fontFamily: 'monospace', margin: '4px 0' }}>
                        {sign.value}
                      </div>
                      <span style={{ fontSize: '11px', color: '#94a3b8' }}>{sign.unit}</span>

                      <p style={{ margin: '10px 0 0 0', fontSize: '12px', color: '#cbd5e1', lineHeight: 1.4 }}>
                        {sign.description}
                      </p>
                    </div>

                    <div style={{ borderTop: '1px solid rgba(148, 163, 184, 0.15)', paddingTop: '10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: '10.5px', color: '#64748b' }}>
                        Sensor: <strong>{sign.satelliteOrSensor}</strong>
                      </span>
                      <a
                        href={sign.earthdataUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{ color: '#38bdf8', fontSize: '11px', display: 'flex', alignItems: 'center', gap: '4px', textDecoration: 'none' }}
                      >
                        <span>Dataset</span>
                        <ExternalLink size={11} />
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 3: NASA APOD */}
          {activeTab === 'apod' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {apodData ? (
                <div
                  style={{
                    background: 'rgba(15, 23, 42, 0.8)',
                    border: '1px solid rgba(56, 189, 248, 0.3)',
                    borderRadius: '14px',
                    overflow: 'hidden',
                    display: 'grid',
                    gridTemplateColumns: 'minmax(320px, 480px) 1fr',
                    gap: '20px',
                  }}
                >
                  <div style={{ background: '#020617', display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '360px' }}>
                    <img
                      src={apodData.url}
                      alt={apodData.title}
                      style={{ width: '100%', height: '100%', objectFit: 'cover', maxHeight: '480px' }}
                    />
                  </div>

                  <div style={{ padding: '24px 20px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', gap: '16px' }}>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ fontSize: '11px', fontWeight: 700, color: '#f59e0b', textTransform: 'uppercase' }}>
                          NASA API: api.nasa.gov/planetary/apod
                        </span>
                        <span style={{ fontSize: '11px', color: '#94a3b8' }}>• {apodData.date}</span>
                      </div>
                      <h3 style={{ margin: '8px 0', fontSize: '20px', color: '#ffffff', fontWeight: 800 }}>
                        {apodData.title}
                      </h3>
                      {apodData.copyright && (
                        <div style={{ fontSize: '11.5px', color: '#94a3b8', marginBottom: '12px' }}>
                          Credit: <strong>{apodData.copyright}</strong>
                        </div>
                      )}
                      <p style={{ fontSize: '13px', lineHeight: 1.6, color: '#cbd5e1', maxHeight: '240px', overflowY: 'auto' }}>
                        {apodData.explanation}
                      </p>
                    </div>

                    <div style={{ display: 'flex', gap: '12px' }}>
                      {apodData.hdurl && (
                        <a
                          href={apodData.hdurl}
                          target="_blank"
                          rel="noopener noreferrer"
                          style={{
                            padding: '8px 16px',
                            background: 'rgba(56, 189, 248, 0.2)',
                            border: '1px solid rgba(56, 189, 248, 0.5)',
                            borderRadius: '8px',
                            color: '#38bdf8',
                            fontSize: '12px',
                            fontWeight: 700,
                            textDecoration: 'none',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '6px',
                          }}
                        >
                          <Eye size={14} />
                          <span>View Full-Res HD</span>
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              ) : (
                <div style={{ textAlign: 'center', padding: '60px 20px', color: '#94a3b8' }}>
                  Loading NASA Astronomy Picture of the Day...
                </div>
              )}
            </div>
          )}

          {/* TAB 4: NEOWS ASTEROIDS */}
          {activeTab === 'neows' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div
                style={{
                  background: 'rgba(15, 23, 42, 0.7)',
                  border: '1px solid rgba(56, 189, 248, 0.25)',
                  borderRadius: '12px',
                  padding: '16px 20px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}
              >
                <div>
                  <h4 style={{ margin: 0, fontSize: '16px', color: '#ffffff', fontWeight: 800 }}>
                    Near-Earth Asteroid Radar (NASA NeoWs)
                  </h4>
                  <p style={{ margin: '4px 0 0 0', fontSize: '12px', color: '#94a3b8' }}>
                    Live tracking of celestial bodies passing close to Earth orbit today, powered by <strong>api.nasa.gov/neo</strong>.
                  </p>
                </div>
                <div style={{ padding: '6px 12px', borderRadius: '8px', background: 'rgba(34, 197, 94, 0.15)', border: '1px solid rgba(34, 197, 94, 0.4)', color: '#4ade80', fontSize: '12px', fontWeight: 700 }}>
                  0 Impact Threats Detected
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(310px, 1fr))', gap: '14px' }}>
                {neowsList.map((neo) => (
                  <div
                    key={neo.id}
                    style={{
                      background: 'rgba(15, 23, 42, 0.75)',
                      border: neo.isPotentiallyHazardous ? '1.5px solid rgba(239, 68, 68, 0.5)' : '1px solid rgba(56, 189, 248, 0.2)',
                      borderRadius: '12px',
                      padding: '16px',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '10px',
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <strong style={{ fontSize: '14px', color: '#ffffff' }}>{neo.name}</strong>
                      {neo.isPotentiallyHazardous ? (
                        <span style={{ fontSize: '10px', fontWeight: 700, padding: '2px 6px', borderRadius: '4px', background: 'rgba(239, 68, 68, 0.2)', color: '#f87171', display: 'flex', alignItems: 'center', gap: '3px' }}>
                          <AlertTriangle size={10} />
                          Hazard Watch
                        </span>
                      ) : (
                        <span style={{ fontSize: '10px', fontWeight: 700, padding: '2px 6px', borderRadius: '4px', background: 'rgba(34, 197, 94, 0.15)', color: '#4ade80' }}>
                          Safe Flyby
                        </span>
                      )}
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', background: 'rgba(2, 6, 23, 0.6)', padding: '10px', borderRadius: '8px' }}>
                      <div>
                        <span style={{ fontSize: '10px', color: '#94a3b8' }}>Est. Diameter</span>
                        <div style={{ fontSize: '13px', fontWeight: 700, color: '#f59e0b' }}>
                          {neo.estimatedDiameterMeters.min} – {neo.estimatedDiameterMeters.max} m
                        </div>
                      </div>

                      <div>
                        <span style={{ fontSize: '10px', color: '#94a3b8' }}>Relative Speed</span>
                        <div style={{ fontSize: '13px', fontWeight: 700, color: '#38bdf8' }}>
                          {neo.relativeVelocityKmh.toLocaleString()} km/h
                        </div>
                      </div>

                      <div>
                        <span style={{ fontSize: '10px', color: '#94a3b8' }}>Miss Distance</span>
                        <div style={{ fontSize: '13px', fontWeight: 700, color: '#ffffff' }}>
                          {(neo.missDistanceKm / 1000000).toFixed(2)}M km
                        </div>
                      </div>

                      <div>
                        <span style={{ fontSize: '10px', color: '#94a3b8' }}>Lunar Distances</span>
                        <div style={{ fontSize: '13px', fontWeight: 700, color: '#a78bfa' }}>
                          {neo.missDistanceLunar} LD
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 5: MARS WEATHER & SURFACE */}
          {activeTab === 'mars' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div
                style={{
                  background: 'linear-gradient(135deg, rgba(239, 68, 68, 0.15), rgba(185, 28, 28, 0.25))',
                  border: '1px solid rgba(239, 68, 68, 0.4)',
                  borderRadius: '12px',
                  padding: '18px 22px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  flexWrap: 'wrap',
                  gap: '16px',
                }}
              >
                <div>
                  <span style={{ fontSize: '11px', fontWeight: 800, textTransform: 'uppercase', color: '#f87171' }}>
                    NASA JPL / InSight &amp; MEDA Station
                  </span>
                  <h3 style={{ margin: '4px 0 2px 0', fontSize: '20px', color: '#ffffff', fontWeight: 800 }}>
                    Mars Surface Weather Telemetry (Jezero &amp; Elysium Planitia)
                  </h3>
                  <p style={{ margin: 0, fontSize: '12px', color: '#cbd5e1' }}>
                    Sol {marsWeather?.sol || 1084} • {marsWeather?.season}
                  </p>
                </div>

                <div style={{ display: 'flex', gap: '14px', flexWrap: 'wrap' }}>
                  <div style={{ background: 'rgba(2, 6, 23, 0.7)', padding: '10px 16px', borderRadius: '8px', border: '1px solid rgba(239, 68, 68, 0.3)' }}>
                    <span style={{ fontSize: '10px', color: '#94a3b8', display: 'block' }}>Atmospheric Temp</span>
                    <strong style={{ fontSize: '16px', color: '#f87171' }}>
                      {marsWeather?.minTempC}°C / {marsWeather?.maxTempC}°C
                    </strong>
                  </div>

                  <div style={{ background: 'rgba(2, 6, 23, 0.7)', padding: '10px 16px', borderRadius: '8px', border: '1px solid rgba(239, 68, 68, 0.3)' }}>
                    <span style={{ fontSize: '10px', color: '#94a3b8', display: 'block' }}>Surface Pressure</span>
                    <strong style={{ fontSize: '16px', color: '#38bdf8' }}>
                      {marsWeather?.pressurePa} Pa (0.7% Earth)
                    </strong>
                  </div>

                  <div style={{ background: 'rgba(2, 6, 23, 0.7)', padding: '10px 16px', borderRadius: '8px', border: '1px solid rgba(239, 68, 68, 0.3)' }}>
                    <span style={{ fontSize: '10px', color: '#94a3b8', display: 'block' }}>Wind Speed</span>
                    <strong style={{ fontSize: '16px', color: '#4ade80' }}>
                      {marsWeather?.windSpeedKmh} km/h
                    </strong>
                  </div>
                </div>
              </div>

              <div style={{ background: 'rgba(15, 23, 42, 0.7)', padding: '18px', borderRadius: '12px', border: '1px solid rgba(148, 163, 184, 0.15)' }}>
                <h4 style={{ margin: '0 0 8px 0', fontSize: '14px', color: '#ffffff' }}>
                  Why Is Martian Weather Crucial for NASA Human Outposts?
                </h4>
                <p style={{ margin: 0, fontSize: '12.5px', lineHeight: 1.6, color: '#cbd5e1' }}>
                  Mars’s atmosphere is 95% carbon dioxide and has a surface pressure less than 1% of Earth’s. Nighttime temperatures drop to -82°C, meaning habitat heaters and MOXIE oxygen generation units must constantly adapt. In our Jr_AstroCamp Outpost Construction simulator, Sol weather directly impacts battery solar array recharge rates and suit life-support consumption!
                </p>
              </div>
            </div>
          )}

          {/* TAB 6: API KEYS */}
          {activeTab === 'apikeys' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', maxWidth: '640px' }}>
              <div style={{ background: 'rgba(15, 23, 42, 0.8)', border: '1px solid rgba(56, 189, 248, 0.3)', borderRadius: '12px', padding: '20px' }}>
                <h4 style={{ margin: '0 0 8px 0', fontSize: '16px', color: '#ffffff', fontWeight: 800 }}>
                  NASA API Portal (api.nasa.gov)
                </h4>
                <p style={{ margin: 0, fontSize: '12.5px', color: '#cbd5e1', lineHeight: 1.5 }}>
                  NASA’s open data APIs are free and publicly accessible. By default, Jr. AstroCamp runs on NASA’s shared <code>DEMO_KEY</code> (up to 30 requests per hour). You can obtain your own personal free NASA API key in seconds without any special access!
                </p>

                <div style={{ marginTop: '16px', padding: '12px 14px', background: 'rgba(2, 6, 23, 0.7)', borderRadius: '8px', border: '1px solid rgba(56, 189, 248, 0.2)' }}>
                  <div style={{ fontSize: '11px', color: '#94a3b8' }}>Currently Active API Key:</div>
                  <strong style={{ fontSize: '14px', color: activeKey === 'DEMO_KEY' ? '#f59e0b' : '#4ade80', fontFamily: 'monospace' }}>
                    {activeKey} {activeKey === 'DEMO_KEY' ? '(Shared Demo Mode)' : '(Custom User Key)'}
                  </strong>
                </div>

                <div style={{ marginTop: '16px' }}>
                  <label style={{ fontSize: '12px', fontWeight: 700, color: '#e2e8f0', display: 'block', marginBottom: '6px' }}>
                    Enter Custom NASA API Key:
                  </label>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <input
                      type="text"
                      placeholder="Paste your key from api.nasa.gov"
                      value={customKeyInput}
                      onChange={(e) => setCustomKeyInput(e.target.value)}
                      style={{
                        flex: 1,
                        background: 'rgba(2, 6, 23, 0.8)',
                        border: '1px solid rgba(148, 163, 184, 0.3)',
                        borderRadius: '8px',
                        padding: '8px 12px',
                        color: '#ffffff',
                        fontSize: '13px',
                        fontFamily: 'monospace',
                      }}
                    />
                    <button
                      onClick={handleSaveApiKey}
                      style={{
                        padding: '8px 16px',
                        background: '#0284c7',
                        border: 'none',
                        borderRadius: '8px',
                        color: '#ffffff',
                        fontSize: '12px',
                        fontWeight: 700,
                        cursor: 'pointer',
                      }}
                    >
                      Save Key
                    </button>
                  </div>

                  {keySavedToast && (
                    <div style={{ marginTop: '8px', fontSize: '12px', color: '#4ade80', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <CheckCircle2 size={14} />
                      <span>API key saved to local mission storage!</span>
                    </div>
                  )}
                </div>

                <div style={{ marginTop: '16px', borderTop: '1px solid rgba(148, 163, 184, 0.15)', paddingTop: '12px' }}>
                  <a
                    href="https://api.nasa.gov/"
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ color: '#38bdf8', fontSize: '12px', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '6px' }}
                  >
                    <span>Generate Free NASA API Key at api.nasa.gov</span>
                    <ExternalLink size={13} />
                  </a>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* MODAL FOOTER */}
        <footer
          style={{
            padding: '12px 24px',
            background: 'rgba(15, 23, 42, 0.95)',
            borderTop: '1px solid rgba(56, 189, 248, 0.15)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            fontSize: '11px',
            color: '#94a3b8',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <span>Verified Sources: <strong>data.nasa.gov</strong> • <strong>earthdata.nasa.gov</strong> • <strong>jpl.nasa.gov</strong></span>
            {lastRefreshed && <span>Last sync: {lastRefreshed}</span>}
          </div>

          <button
            onClick={() => {
              soundFx.playClick(600);
              onClose();
            }}
            style={{
              padding: '6px 14px',
              background: 'rgba(30, 41, 59, 0.8)',
              border: '1px solid rgba(148, 163, 184, 0.2)',
              borderRadius: '6px',
              color: '#ffffff',
              fontSize: '11px',
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            Close
          </button>
        </footer>
      </div>
    </div>
  );
};
export default NasaLiveObservatoryModal;
