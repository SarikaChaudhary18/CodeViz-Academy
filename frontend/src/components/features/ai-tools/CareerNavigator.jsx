import React, { useState } from 'react';
import { Compass, Briefcase, Building, Target, CheckCircle2, Award, Search, Building2, Sparkles, ExternalLink, RefreshCw, Landmark } from 'lucide-react';
import { api } from '../../../lib/api';

export default function CareerNavigator() {
  const [activeTab, setActiveTab] = useState('roadmap'); // 'roadmap' | 'matcher' | 'jobs'
  
  // Roadmap Builder states
  const [role, setRole] = useState('Frontend Developer');
  const [company, setCompany] = useState('Google');
  const [loadingRoadmap, setLoadingRoadmap] = useState(false);
  const [pathway, setPathway] = useState(null);

  // Company Fit states
  const [fitInput, setFitInput] = useState('Google');
  const [fitType, setFitType] = useState('company'); // 'company' | 'skills'
  const [loadingFit, setLoadingFit] = useState(false);
  const [fitData, setFitData] = useState(null);

  // LinkedIn Jobs states
  const [searchKeywords, setSearchKeywords] = useState('Frontend Developer');
  const [searchLocation, setSearchLocation] = useState('Bangalore, India');
  const [loadingJobs, setLoadingJobs] = useState(false);
  const [jobsList, setJobsList] = useState([]);
  const [selectedJob, setSelectedJob] = useState(null);

  // 1. Generate Roadmap
  const handleGenerateRoadmap = async (e) => {
    e.preventDefault();
    setLoadingRoadmap(true);
    setPathway(null);

    try {
      const res = await api.post('/ai/tool', {
        toolType: 'career-navigator',
        payload: `Target Role: ${role}, Target Entity: ${company}`
      });

      if (res.status === 'success' || res.data) {
        const result = res.data;
        setPathway({
          difficultyScore: result.estimatedWeeks ? `Estimated Preparation: ${result.estimatedWeeks} Weeks` : "Medium/Hard Tier",
          readinessPct: 75,
          coreSkills: (result.sprintPath || []).map((step, idx) => ({
            name: step,
            level: `Phase Step ${idx + 1}`
          })),
          hiringStages: result.tips || ["Review core domain structures."]
        });
      }
    } catch (err) {
      console.error('Failed to run Career Navigator:', err.message);
      setPathway({
        difficultyScore: "N/A",
        readinessPct: 0,
        coreSkills: [{ name: "Failed to map skills", level: "API key error" }],
        hiringStages: ["Verify your environment keys."]
      });
    } finally {
      setLoadingRoadmap(false);
    }
  };

  // 2. Company & Role Matcher
  const handleCheckFit = async (e) => {
    e.preventDefault();
    setLoadingFit(true);
    setFitData(null);

    try {
      const payloadString = fitType === 'company' 
        ? `Company suitability audit for: "${fitInput}"` 
        : `Company matching for skills/interests: "${fitInput}"`;

      const res = await api.post('/ai/tool', {
        toolType: 'company-role-fit',
        payload: payloadString
      });

      if (res.status === 'success' || res.data) {
        setFitData(res.data);
      }
    } catch (err) {
      console.error('Failed to parse suitability fit:', err.message);
      setFitData({
        fitSummary: "Unable to calculate fit metrics due to connectivity issues.",
        recommendedRoles: []
      });
    } finally {
      setLoadingFit(false);
    }
  };

  // 3. Simulated LinkedIn Job Search
  const handleJobSearch = async (e) => {
    e.preventDefault();
    setLoadingJobs(true);
    setJobsList([]);
    setSelectedJob(null);

    try {
      const res = await api.post('/ai/tool', {
        toolType: 'simulated-job-search',
        payload: {
          keywords: searchKeywords,
          location: searchLocation
        }
      });

      if (res.status === 'success' || res.data) {
        const jobs = res.data.jobs || [];
        setJobsList(jobs);
        if (jobs.length > 0) {
          setSelectedJob(jobs[0]);
        }
      }
    } catch (err) {
      console.error('Failed to fetch simulated jobs:', err.message);
    } finally {
      setLoadingJobs(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6 text-left">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-black text-zinc-950 flex items-center gap-2">
          <Compass className="text-orange-600 w-8 h-8 animate-pulse" />
          AI CAREER NAVIGATOR
        </h1>
        <p className="text-xs text-zinc-500 font-mono uppercase tracking-widest mt-1">
          Compute target roles, verify company suitability, and audit active LinkedIn jobs
        </p>
      </div>

      {/* Navigation Tabs */}
      <div className="flex border-b border-zinc-200 gap-6">
        <button
          onClick={() => setActiveTab('roadmap')}
          className={`pb-3 text-xs font-mono font-bold tracking-wider uppercase border-b-2 transition-all cursor-pointer flex items-center gap-1.5 ${
            activeTab === 'roadmap' ? 'border-orange-600 text-orange-600' : 'border-transparent text-zinc-400 hover:text-zinc-650'
          }`}
        >
          <Compass size={14} /> Prep Roadmap
        </button>
        <button
          onClick={() => setActiveTab('matcher')}
          className={`pb-3 text-xs font-mono font-bold tracking-wider uppercase border-b-2 transition-all cursor-pointer flex items-center gap-1.5 ${
            activeTab === 'matcher' ? 'border-orange-600 text-orange-600' : 'border-transparent text-zinc-400 hover:text-zinc-650'
          }`}
        >
          <Building2 size={14} /> Company Suitability
        </button>
        <button
          onClick={() => setActiveTab('jobs')}
          className={`pb-3 text-xs font-mono font-bold tracking-wider uppercase border-b-2 transition-all cursor-pointer flex items-center gap-1.5 ${
            activeTab === 'jobs' ? 'border-orange-600 text-orange-600' : 'border-transparent text-zinc-400 hover:text-zinc-650'
          }`}
        >
          <Briefcase size={14} /> LinkedIn Job Finder
        </button>
      </div>

      {/* Tabs Content */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

        {/* ================= ROADMAP BUILDER TAB ================= */}
        {activeTab === 'roadmap' && (
          <>
            {/* Input Form */}
            <div className="lg:col-span-5 bg-white border border-zinc-200 rounded-3xl p-6 shadow-sm flex flex-col justify-between">
              <form onSubmit={handleGenerateRoadmap} className="space-y-4">
                <h2 className="text-sm font-mono font-bold text-zinc-950 uppercase tracking-wider border-b border-zinc-100 pb-3">
                  Target Blueprint
                </h2>

                <div className="space-y-1">
                  <label className="text-[10px] font-mono uppercase tracking-wider block font-bold text-zinc-500">
                    Target Role
                  </label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-zinc-400">
                      <Briefcase size={14} />
                    </span>
                    <input
                      type="text"
                      value={role}
                      onChange={(e) => setRole(e.target.value)}
                      placeholder="e.g. Frontend Developer"
                      required
                      className="w-full h-10 pl-9 pr-3 rounded-xl border border-zinc-200 text-xs focus:outline-none focus:border-orange-500 bg-zinc-50 text-zinc-950"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-mono uppercase tracking-wider block font-bold text-zinc-500">
                    Target Corporate Entity
                  </label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-zinc-400">
                      <Building size={14} />
                    </span>
                    <input
                      type="text"
                      value={company}
                      onChange={(e) => setCompany(e.target.value)}
                      placeholder="e.g. Google"
                      required
                      className="w-full h-10 pl-9 pr-3 rounded-xl border border-zinc-200 text-xs focus:outline-none focus:border-orange-500 bg-zinc-50 text-zinc-955"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loadingRoadmap}
                  className="w-full h-10 bg-orange-600 hover:bg-orange-500 text-white font-mono text-xs font-bold rounded-xl transition-all shadow-sm cursor-pointer disabled:opacity-50 flex items-center justify-center gap-1.5"
                >
                  {loadingRoadmap ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" /> Mapping stages...
                    </>
                  ) : 'Compute Prep Roadmap'}
                </button>
              </form>
            </div>

            {/* Path details */}
            <div className="lg:col-span-7 bg-white border border-zinc-200 rounded-3xl p-6 shadow-sm min-h-[300px]">
              <h2 className="text-sm font-mono font-bold text-zinc-950 uppercase tracking-wider mb-4">
                Career Path Assessment
              </h2>

              {loadingRoadmap && (
                <div className="py-12 text-center text-zinc-500 font-mono text-xs space-y-3 animate-pulse">
                  <div className="w-8 h-8 rounded-full border-4 border-orange-500/10 border-t-orange-500 animate-spin mx-auto" />
                  <p>Computing stages and skill requirements...</p>
                </div>
              )}

              {!pathway && !loadingRoadmap && (
                <div className="py-16 text-center text-zinc-400 font-mono text-xs">
                  Submit target company and role parameters to parse preparation guidelines.
                </div>
              )}

              {pathway && !loadingRoadmap && (
                <div className="space-y-5">
                  <div className="flex justify-between items-center p-3.5 bg-orange-50/50 border border-orange-100 rounded-xl">
                    <div>
                      <span className="text-[9px] font-mono text-zinc-500 uppercase block">Interview Difficulty</span>
                      <span className="text-xs font-bold text-orange-600 font-mono">{pathway.difficultyScore}</span>
                    </div>
                    <div className="text-right">
                      <span className="text-[9px] font-mono text-zinc-500 block">Your Match Index</span>
                      <span className="text-sm font-black text-orange-600 font-mono">{pathway.readinessPct}%</span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <span className="text-[10px] font-mono text-zinc-550 uppercase font-bold flex items-center gap-1.5">
                      <Target size={12} className="text-orange-600" /> Key Skill Dimensions
                    </span>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {pathway.coreSkills.map((skill, index) => (
                        <div key={index} className="p-3 bg-zinc-50 border border-zinc-150 rounded-xl">
                          <span className="text-[11px] font-bold text-zinc-900 block">{skill.name}</span>
                          <span className="text-[9px] font-mono text-zinc-500 mt-0.5 block">{skill.level}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <span className="text-[10px] font-mono text-zinc-555 uppercase font-bold flex items-center gap-1.5">
                      <Award size={12} className="text-orange-600" /> Target Prep Suggestions
                    </span>
                    <div className="space-y-1.5">
                      {pathway.hiringStages.map((stage, index) => (
                        <div key={index} className="flex gap-2 items-center text-xs text-zinc-700 font-mono">
                          <CheckCircle2 size={13} className="text-orange-600 shrink-0" />
                          <span>{stage}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </>
        )}

        {/* ================= COMPANY SUITABILITY TAB ================= */}
        {activeTab === 'matcher' && (
          <>
            {/* Input Form */}
            <div className="lg:col-span-5 bg-white border border-zinc-200 rounded-3xl p-6 shadow-sm flex flex-col justify-between">
              <form onSubmit={handleCheckFit} className="space-y-4">
                <h2 className="text-sm font-mono font-bold text-zinc-950 uppercase tracking-wider border-b border-zinc-100 pb-3">
                  Suitability Filter
                </h2>

                <div className="space-y-2.5">
                  <label className="text-[10px] font-mono uppercase tracking-wider block font-bold text-zinc-500">
                    Fit Method
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => { setFitType('company'); setFitInput('Google'); }}
                      className={`py-2 text-xs font-mono font-bold border rounded-xl transition-all cursor-pointer ${
                        fitType === 'company' ? 'bg-orange-50 border-orange-500 text-orange-600' : 'border-zinc-200 text-zinc-500 hover:bg-zinc-50'
                      }`}
                    >
                      Search Company
                    </button>
                    <button
                      type="button"
                      onClick={() => { setFitType('skills'); setFitInput('React, Node.js, AWS'); }}
                      className={`py-2 text-xs font-mono font-bold border rounded-xl transition-all cursor-pointer ${
                        fitType === 'skills' ? 'bg-orange-50 border-orange-500 text-orange-600' : 'border-zinc-200 text-zinc-500 hover:bg-zinc-50'
                      }`}
                    >
                      Search Skills
                    </button>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-mono uppercase tracking-wider block font-bold text-zinc-500">
                    {fitType === 'company' ? 'Target Company' : 'Your Skills / Tech Stack'}
                  </label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-zinc-400">
                      {fitType === 'company' ? <Landmark size={14} /> : <Target size={14} />}
                    </span>
                    <input
                      type="text"
                      value={fitInput}
                      onChange={(e) => setFitInput(e.target.value)}
                      placeholder={fitType === 'company' ? 'e.g. Netflix' : 'e.g. React, Python, SQL'}
                      required
                      className="w-full h-10 pl-9 pr-3 rounded-xl border border-zinc-200 text-xs focus:outline-none focus:border-orange-500 bg-zinc-50 text-zinc-950"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loadingFit}
                  className="w-full h-10 bg-orange-600 hover:bg-orange-500 text-white font-mono text-xs font-bold rounded-xl transition-all shadow-sm cursor-pointer disabled:opacity-50 flex items-center justify-center gap-1.5"
                >
                  {loadingFit ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" /> Analyzing suitability...
                    </>
                  ) : 'Audit Suitability Match'}
                </button>
              </form>
            </div>

            {/* Analysis details */}
            <div className="lg:col-span-7 bg-white border border-zinc-200 rounded-3xl p-6 shadow-sm min-h-[300px]">
              <h2 className="text-sm font-mono font-bold text-zinc-950 uppercase tracking-wider mb-4 flex items-center gap-1.5">
                <Sparkles size={16} className="text-orange-600" /> AI Suitability Analysis
              </h2>

              {loadingFit && (
                <div className="py-12 text-center text-zinc-500 font-mono text-xs space-y-3 animate-pulse">
                  <div className="w-8 h-8 rounded-full border-4 border-orange-500/10 border-t-orange-500 animate-spin mx-auto" />
                  <p>Processing fit parameters and team metrics...</p>
                </div>
              )}

              {!fitData && !loadingFit && (
                <div className="py-16 text-center text-zinc-400 font-mono text-xs">
                  Run a check to see how skills match companies and identify the best-fitting roles.
                </div>
              )}

              {fitData && !loadingFit && (
                <div className="space-y-4">
                  <div className="p-4 bg-zinc-50 border border-zinc-150 rounded-2xl text-xs leading-relaxed font-semibold text-zinc-800 font-mono">
                    {fitData.fitSummary}
                  </div>

                  <div className="space-y-2">
                    <span className="text-[10px] font-mono text-zinc-500 uppercase font-bold">Recommended Matches</span>
                    <div className="space-y-2.5">
                      {(fitData.recommendedRoles || []).map((item, idx) => (
                        <div key={idx} className="p-4 border border-zinc-150 rounded-2xl space-y-2 bg-white">
                          <div className="flex justify-between items-center">
                            <span className="text-xs font-black text-zinc-900 font-mono">{item.role}</span>
                            <span className="text-xs font-mono font-bold px-2 py-0.5 rounded-full bg-orange-50 border border-orange-200 text-orange-600">
                              {item.suitabilityScore}% Fit
                            </span>
                          </div>
                          <p className="text-[11px] text-zinc-550 leading-relaxed font-mono">{item.whyItFits}</p>
                          <div className="text-[9px] text-zinc-400 font-mono flex items-center gap-1">
                            <Building2 size={10} /> Team: <span className="font-semibold text-zinc-600">{item.keyTeams}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </>
        )}

        {/* ================= LINKEDIN JOBS TAB ================= */}
        {activeTab === 'jobs' && (
          <div className="lg:col-span-12 grid grid-cols-1 lg:grid-cols-12 gap-6">
            
            {/* Search Controls */}
            <div className="lg:col-span-12 bg-white border border-zinc-200 rounded-3xl p-5 shadow-sm">
              <form onSubmit={handleJobSearch} className="flex flex-col md:flex-row gap-4 items-end">
                <div className="flex-1 space-y-1">
                  <label className="text-[10px] font-mono uppercase tracking-wider block font-bold text-zinc-500">
                    Keywords
                  </label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-zinc-400">
                      <Search size={14} />
                    </span>
                    <input
                      type="text"
                      value={searchKeywords}
                      onChange={(e) => setSearchKeywords(e.target.value)}
                      placeholder="e.g. Backend Developer"
                      required
                      className="w-full h-10 pl-9 pr-3 rounded-xl border border-zinc-200 text-xs focus:outline-none focus:border-orange-500 bg-zinc-50 text-zinc-950"
                    />
                  </div>
                </div>

                <div className="flex-1 space-y-1">
                  <label className="text-[10px] font-mono uppercase tracking-wider block font-bold text-zinc-500">
                    Location
                  </label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-zinc-400">
                      <Compass size={14} />
                    </span>
                    <input
                      type="text"
                      value={searchLocation}
                      onChange={(e) => setSearchLocation(e.target.value)}
                      placeholder="e.g. London, UK"
                      required
                      className="w-full h-10 pl-9 pr-3 rounded-xl border border-zinc-200 text-xs focus:outline-none focus:border-orange-500 bg-zinc-50 text-zinc-950"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loadingJobs}
                  className="px-6 h-10 bg-orange-600 hover:bg-orange-500 text-white font-mono text-xs font-bold rounded-xl transition-all shadow-sm cursor-pointer disabled:opacity-50 flex items-center justify-center gap-1.5"
                >
                  {loadingJobs ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" /> Searching...
                    </>
                  ) : 'Search LinkedIn'}
                </button>
              </form>
            </div>

            {/* Main job list and detail split */}
            <div className="lg:col-span-12 grid grid-cols-1 lg:grid-cols-12 gap-6 min-h-[400px]">
              
              {/* Jobs List Panel */}
              <div className="lg:col-span-5 bg-white border border-zinc-200 rounded-3xl p-5 shadow-sm space-y-3 overflow-y-auto max-h-[500px] scrollbar-thin">
                <span className="text-[10px] font-mono text-zinc-400 block uppercase font-bold border-b pb-2">
                  Matching Vacancies ({jobsList.length})
                </span>

                {loadingJobs && (
                  <div className="py-12 text-center text-zinc-500 font-mono text-xs space-y-3 animate-pulse">
                    <div className="w-6 h-6 rounded-full border-2 border-orange-500/15 border-t-orange-500 animate-spin mx-auto" />
                    <p>Scraping LinkedIn feeds...</p>
                  </div>
                )}

                {!loadingJobs && jobsList.length === 0 && (
                  <div className="py-16 text-center text-zinc-400 font-mono text-xs">
                    No active searches. Enter query keywords above.
                  </div>
                )}

                {!loadingJobs && jobsList.map((job) => (
                  <button
                    key={job.id}
                    onClick={() => setSelectedJob(job)}
                    className={`w-full p-4 rounded-2xl border text-left transition-all cursor-pointer flex gap-3 ${
                      selectedJob?.id === job.id 
                        ? 'border-orange-500 bg-orange-50/30' 
                        : 'border-zinc-150 hover:bg-zinc-50 bg-white'
                    }`}
                  >
                    <div className="w-10 h-10 rounded-xl bg-orange-600/10 text-orange-600 font-bold flex items-center justify-center text-xs shrink-0 select-none">
                      {job.company.substring(0, 2).toUpperCase()}
                    </div>
                    <div className="min-w-0 flex-1 space-y-0.5">
                      <h4 className="text-xs font-black text-zinc-900 truncate font-mono">{job.title}</h4>
                      <p className="text-[10px] text-zinc-600 font-semibold truncate font-mono">{job.company}</p>
                      <div className="flex justify-between items-center text-[9px] text-zinc-400 font-mono pt-1">
                        <span>{job.location}</span>
                        <span className="font-bold text-orange-600">{job.postedDate}</span>
                      </div>
                    </div>
                  </button>
                ))}
              </div>

              {/* Job Details Panel */}
              <div className="lg:col-span-7 bg-white border border-zinc-200 rounded-3xl p-6 shadow-sm flex flex-col justify-between max-h-[500px]">
                {selectedJob ? (
                  <div className="flex flex-col h-full justify-between">
                    <div className="space-y-4 overflow-y-auto pr-1 scrollbar-thin">
                      <div className="flex gap-4 items-start border-b border-zinc-100 pb-4">
                        <div className="w-12 h-12 rounded-2xl bg-orange-600 text-white font-black flex items-center justify-center text-sm shadow-sm select-none">
                          {selectedJob.company.substring(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <h3 className="text-sm font-black text-zinc-950 font-mono">{selectedJob.title}</h3>
                          <p className="text-xs font-bold text-orange-600 font-mono">{selectedJob.company}</p>
                          <div className="flex gap-3 text-[10px] text-zinc-400 font-mono mt-1">
                            <span>{selectedJob.location}</span>
                            <span>&bull;</span>
                            <span>{selectedJob.postedDate}</span>
                          </div>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <span className="text-[10px] font-mono text-zinc-400 block uppercase font-bold">Role Description</span>
                        <p className="text-xs text-zinc-700 leading-relaxed font-mono bg-zinc-50 p-4 border border-zinc-150 rounded-2xl whitespace-pre-line">
                          {selectedJob.description}
                        </p>
                      </div>
                    </div>

                    <div className="pt-4 border-t border-zinc-100 mt-4 flex justify-between items-center">
                      <span className="text-[10px] text-zinc-400 font-mono">Simulated LinkedIn Bulletin</span>
                      <a
                        href={selectedJob.applyUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="px-5 py-2 bg-orange-600 hover:bg-orange-500 text-white text-xs font-mono font-bold rounded-xl flex items-center gap-1.5 shadow-sm transition-all"
                      >
                        Apply on LinkedIn <ExternalLink size={12} />
                      </a>
                    </div>
                  </div>
                ) : (
                  <div className="h-full flex items-center justify-center text-zinc-400 font-mono text-xs py-16">
                    Select a job listing to view descriptions and apply details.
                  </div>
                )}
              </div>

            </div>

          </div>
        )}

      </div>
    </div>
  );
}
