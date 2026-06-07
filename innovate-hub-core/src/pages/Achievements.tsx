import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import {
  Trophy,
  Users,
  Calendar,
  PlusCircle,
  Search,
  Filter,
  Star,
  Landmark,
  BookOpen,
  Shield,
  Award,
  Banknote,
  Layers3,
  BadgeCheck,
  TrendingUp,
  Globe,
  Sparkles,
  ArrowRight,
  X,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import api from "@/lib/axios";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { ReadMore } from "@/components/ReadMore";
import { BarChart, Bar, CartesianGrid, Cell, Legend, Line, LineChart, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

interface AchievementItem {
  _id: string;
  title: string;
  description: string;
  date: string;
  achievedBy: string;
  imageUrl?: string;
  achievementType?: string;
  contributionDomain?: string;
  competitionLevel?: string;
  prizeAmount?: number;
  eventYear?: number;
  teamSize?: number;
  ideaHubContributions?: Record<string, boolean>;
}

interface AchievementAnalytics {
  totalAchievements: number;
  totalStudentsParticipated: number;
  totalCompetitions: number;
  totalPrizeMoney: number;
  nationalAchievements: number;
  internationalAchievements: number;
  researchPublications: number;
  patents: number;
}

interface PrizeAnalytics {
  summary: {
    totalPrizeMoney: number;
    statePrizeMoney: number;
    nationalPrizeMoney: number;
    internationalPrizeMoney: number;
    averagePrizeValue: number;
    highestPrizeWon: number;
  };
  charts: {
    yearWisePrizeDistribution: Array<{ year: number; totalPrizeMoney: number; achievementCount: number }>;
    competitionWisePrizeDistribution: Array<{ label: string; totalPrizeMoney: number; count: number }>;
    achievementTypeDistribution: Array<{ name: string; value: number }>;
  };
}

interface ContributionAnalytics {
  workspaceSupportCount: number;
  mentorshipCount: number;
  prototypeDevelopmentCount: number;
  testingFacilityUsage: number;
  competitionRegistrationSupport: number;
  industryMentoringSupport: number;
}

interface TimelineEntry {
  year: number;
  achievements: AchievementItem[];
}

const PAGE_SIZE = 9;

const DEFAULT_FILTERS = {
  search: "",
  achievementType: "all",
  competitionLevel: "all",
  contributionDomain: "all",
  year: "all",
  team: "",
  prizeWinner: "all",
};

function getCurrentUser() {
  try {
    const raw = localStorage.getItem("idea_hub_user");
    const token = localStorage.getItem("idea_hub_token");
    if (!raw || !token) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

const Achievements = () => {
  const [achievements, setAchievements] = useState<AchievementItem[]>([]);
  const [analytics, setAnalytics] = useState<AchievementAnalytics | null>(null);
  const [prizeAnalytics, setPrizeAnalytics] = useState<PrizeAnalytics | null>(null);
  const [contributionAnalytics, setContributionAnalytics] = useState<ContributionAnalytics | null>(null);
  const [timeline, setTimeline] = useState<TimelineEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [analyticsLoading, setAnalyticsLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState({ title: "", description: "", date: "", achievedBy: "", imageUrl: "" });
  const [filters, setFilters] = useState(DEFAULT_FILTERS);
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({ page: 1, limit: PAGE_SIZE, total: 0, totalPages: 1 });
  const user = useMemo(getCurrentUser, []);
  const isCoordinator = user?.role === 'coordinator';

  const filterQuery = useMemo(() => {
    const params: Record<string, string | number> = { page, limit: PAGE_SIZE };
    if (filters.search.trim()) params.search = filters.search.trim();
    if (filters.achievementType !== 'all') params.achievementType = filters.achievementType;
    if (filters.competitionLevel !== 'all') params.competitionLevel = filters.competitionLevel;
    if (filters.contributionDomain !== 'all') params.contributionDomain = filters.contributionDomain;
    if (filters.year !== 'all') params.year = filters.year;
    if (filters.team.trim()) params.team = filters.team.trim();
    if (filters.prizeWinner !== 'all') params.prizeWinner = filters.prizeWinner;
    return params;
  }, [filters, page]);

  const achievementTypes = useMemo(() => [
    'Competition',
    'Hackathon',
    'Workshop',
    'Research Paper',
    'Patent',
    'Project',
    'Internship',
    'Sports',
    'Innovation Challenge',
  ], []);

  const contributionDomains = useMemo(() => [
    'AI/ML',
    'Web Development',
    'Cyber Security',
    'IoT',
    'Robotics',
    'Cloud Computing',
    'Data Science',
    'Embedded Systems',
  ], []);

  const competitionLevels = useMemo(() => ['State', 'National', 'International'], []);

  const availableYears = useMemo(() => {
    const years = new Set<number>();
    if (timeline.length > 0) {
      timeline.forEach((entry) => years.add(entry.year));
    }
    achievements.forEach((item) => {
      const year = item.eventYear || new Date(item.date).getFullYear();
      if (year) years.add(year);
    });
    return Array.from(years).sort((a, b) => b - a);
  }, [timeline, achievements]);

  const analyticsCards = useMemo(() => [
    { icon: Trophy, label: 'Total Achievements', value: analytics?.totalAchievements ?? 0, color: 'text-yellow-600 dark:text-yellow-400', bg: 'bg-yellow-500/10' },
    { icon: Users, label: 'Students Participated', value: analytics?.totalStudentsParticipated ?? 0, color: 'text-blue-600 dark:text-blue-400', bg: 'bg-blue-500/10' },
    { icon: Award, label: 'Competitions', value: analytics?.totalCompetitions ?? 0, color: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-500/10' },
    { icon: Banknote, label: 'Total Prize Money', value: `₹${Number(analytics?.totalPrizeMoney ?? 0).toLocaleString('en-IN')}`, color: 'text-rose-600 dark:text-rose-400', bg: 'bg-rose-500/10' },
    { icon: Globe, label: 'National Achievements', value: analytics?.nationalAchievements ?? 0, color: 'text-indigo-600 dark:text-indigo-400', bg: 'bg-indigo-500/10' },
    { icon: Globe, label: 'International Achievements', value: analytics?.internationalAchievements ?? 0, color: 'text-cyan-600 dark:text-cyan-400', bg: 'bg-cyan-500/10' },
    { icon: BookOpen, label: 'Research Publications', value: analytics?.researchPublications ?? 0, color: 'text-violet-600 dark:text-violet-400', bg: 'bg-violet-500/10' },
    { icon: Shield, label: 'Patents', value: analytics?.patents ?? 0, color: 'text-teal-600 dark:text-teal-400', bg: 'bg-teal-500/10' },
  ], [analytics]);

  const prizeCards = useMemo(() => [
    { label: 'State Prize Money', value: `₹${Number(prizeAnalytics?.summary.statePrizeMoney ?? 0).toLocaleString('en-IN')}` },
    { label: 'National Prize Money', value: `₹${Number(prizeAnalytics?.summary.nationalPrizeMoney ?? 0).toLocaleString('en-IN')}` },
    { label: 'International Prize Money', value: `₹${Number(prizeAnalytics?.summary.internationalPrizeMoney ?? 0).toLocaleString('en-IN')}` },
    { label: 'Average Prize Value', value: `₹${Number(prizeAnalytics?.summary.averagePrizeValue ?? 0).toLocaleString('en-IN', { maximumFractionDigits: 0 })}` },
    { label: 'Highest Prize Won', value: `₹${Number(prizeAnalytics?.summary.highestPrizeWon ?? 0).toLocaleString('en-IN')}` },
  ], [prizeAnalytics]);

  const fetchAnalytics = async () => {
    try {
      setAnalyticsLoading(true);
      const [analyticsRes, prizeRes, contributionRes, timelineRes] = await Promise.all([
        api.get('/achievements/analytics'),
        api.get('/achievements/prize-analytics'),
        api.get('/achievements/contributions'),
        api.get('/achievements/timeline'),
      ]);
      setAnalytics(analyticsRes.data);
      setPrizeAnalytics(prizeRes.data);
      setContributionAnalytics(contributionRes.data);
      setTimeline(timelineRes.data || []);
    } catch {
      toast.error('Failed to load achievement analytics');
    } finally {
      setAnalyticsLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, []);

  useEffect(() => {
    const fetchAchievements = async () => {
      try {
        setLoading(true);
        const res = await api.get('/achievements/filter', { params: filterQuery });
        setAchievements(res.data?.data || []);
        setPagination(res.data?.pagination || { page: 1, limit: PAGE_SIZE, total: 0, totalPages: 1 });
      } catch {
        toast.error('Failed to load achievements');
      } finally {
        setLoading(false);
      }
    };
    fetchAchievements();
  }, [filterQuery]);

  useEffect(() => {
    setPage(1);
  }, [filters.search, filters.achievementType, filters.competitionLevel, filters.contributionDomain, filters.year, filters.team, filters.prizeWinner]);

  const clearFilters = () => {
    setFilters(DEFAULT_FILTERS);
    setPage(1);
  };

  const formatCurrency = (value?: number) => `₹${Number(value || 0).toLocaleString('en-IN')}`;

  const getContributionLabels = (contributions?: Record<string, boolean>) => {
    if (!contributions) return [];
    const labels = [] as string[];
    if (contributions.workspaceProvided) labels.push('Workspace Provided');
    if (contributions.meetingRoomAccess) labels.push('Meeting Room Access');
    if (contributions.dPrintingSupport) labels.push('3D Printing Support');
    if (contributions.electronicsComponents) labels.push('Electronics Components');
    if (contributions.prototypeDevelopment) labels.push('Prototype Development');
    if (contributions.testingFacility) labels.push('Testing Facility');
    if (contributions.mentorshipSupport) labels.push('Mentorship Support');
    if (contributions.presentationGuidance) labels.push('Presentation Guidance');
    if (contributions.competitionRegistration) labels.push('Competition Registration');
    if (contributions.industryMentoring) labels.push('Industry Mentoring');
    return labels;
  };

  const topTimelineYear = timeline[0]?.year;

  const prizeChartData = prizeAnalytics?.charts?.yearWisePrizeDistribution || [];
  const competitionPrizeData = prizeAnalytics?.charts?.competitionWisePrizeDistribution || [];
  const typeDistributionData = prizeAnalytics?.charts?.achievementTypeDistribution || [];

  const chartColors = ['#f59e0b', '#2563eb', '#10b981', '#8b5cf6', '#ef4444', '#14b8a6'];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const formData = new FormData();
      formData.append('title', form.title);
      formData.append('description', form.description);
      formData.append('date', new Date(form.date).toISOString());
      formData.append('achievedBy', form.achievedBy);
      if (form.imageUrl) formData.append('imageUrl', form.imageUrl);
      
      const fileInput = document.getElementById('achievement-image') as HTMLInputElement | null;
      if (fileInput?.files && fileInput.files[0]) {
        formData.append('image', fileInput.files[0]);
      }

      if (editingId) {
        // Update
        const res = await api.put(`/achievements/${editingId}`, formData, { headers: { 'Content-Type': 'multipart/form-data' } });
        setAchievements(achievements.map(a => a._id === editingId ? res.data : a));
        toast.success('Achievement updated');
      } else {
        // Create
        const res = await api.post('/achievements', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
        setAchievements([res.data, ...achievements]);
        toast.success('Achievement created');
      }
      
      setOpen(false);
      setForm({ title: "", description: "", date: "", achievedBy: "", imageUrl: "" });
      setEditingId(null);
      fetchAnalytics();
    } catch {
      toast.error(editingId ? 'Failed to update achievement' : 'Failed to create achievement');
    }
  };

  const startEdit = (achievement: AchievementItem) => {
    setEditingId(achievement._id);
    setForm({
      title: achievement.title,
      description: achievement.description,
      date: new Date(achievement.date).toISOString().split('T')[0],
      achievedBy: achievement.achievedBy,
      imageUrl: achievement.imageUrl || ""
    });
    setOpen(true);
  };

  const renderPagination = () => {
    if (pagination.totalPages <= 1) return null;

    return (
      <Pagination className="mt-8">
        <PaginationContent>
          <PaginationItem>
            <PaginationPrevious
              href="#"
              onClick={(e) => {
                e.preventDefault();
                setPage((current) => Math.max(1, current - 1));
              }}
              className={page === 1 ? 'pointer-events-none opacity-50' : ''}
            />
          </PaginationItem>
          <PaginationItem>
            <span className="px-4 py-2 text-sm text-muted-foreground">
              Page {pagination.page} of {pagination.totalPages}
            </span>
          </PaginationItem>
          <PaginationItem>
            <PaginationNext
              href="#"
              onClick={(e) => {
                e.preventDefault();
                setPage((current) => Math.min(pagination.totalPages, current + 1));
              }}
              className={page >= pagination.totalPages ? 'pointer-events-none opacity-50' : ''}
            />
          </PaginationItem>
        </PaginationContent>
      </Pagination>
    );
  };

  return (
    <div className="container mx-auto px-4 py-8 space-y-10">
      <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
        <div className="space-y-3 max-w-3xl">
          <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-primary">
            <Sparkles className="w-3.5 h-3.5" /> Innovation Showcase
          </div>
          <div>
            <h1 className="text-3xl sm:text-4xl font-bold text-foreground mb-2">Achievements</h1>
            <p className="text-muted-foreground text-sm sm:text-base max-w-2xl">
              Celebrating innovation, research, competitions, and the IDEA Hub support behind each milestone.
            </p>
          </div>
        </div>
        {isCoordinator ? (
          <Dialog open={open} onOpenChange={(val) => { if(!val) { setEditingId(null); setForm({ title: "", description: "", date: "", achievedBy: "", imageUrl: "" }); } setOpen(val); }}>
            <DialogTrigger asChild>
              <button className="inline-flex items-center px-4 py-2 bg-primary text-primary-foreground rounded-md text-sm font-medium shadow-sm hover:opacity-90 transition-opacity">
                <PlusCircle className="w-4 h-4 mr-2" /> Add Achievement
              </button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{editingId ? "Edit Achievement" : "Add Achievement"}</DialogTitle>
                <DialogDescription>Provide details and optionally an image.</DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="title">Title</Label>
                  <Input id="title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required />
                </div>
                <div>
                  <Label htmlFor="description">Description</Label>
                  <Textarea id="description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} required />
                </div>
                <div>
                  <Label htmlFor="date">Date</Label>
                  <Input id="date" type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} required />
                </div>
                <div>
                  <Label htmlFor="achievedBy">Achieved By</Label>
                  <Input id="achievedBy" value={form.achievedBy} onChange={(e) => setForm({ ...form, achievedBy: e.target.value })} required />
                </div>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="achievement-image">Upload Image (optional)</Label>
                    <Input id="achievement-image" type="file" accept="image/*" />
                  </div>
                  <div>
                    <Label htmlFor="imageUrl">Or Image URL</Label>
                    <Input id="imageUrl" value={form.imageUrl} onChange={(e) => setForm({ ...form, imageUrl: e.target.value })} placeholder="https://..." />
                  </div>
                </div>
                <DialogFooter>
                  <button type="submit" className="px-4 py-2 bg-primary text-primary-foreground rounded-md text-sm font-medium">
                    {editingId ? "Update" : "Create"}
                  </button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        ) : null}
      </div>

      <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card className="relative overflow-hidden border border-border/60 shadow-sm">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent pointer-events-none" />
            <CardHeader className="relative z-10">
              <CardTitle className="flex items-center gap-2 text-xl">
                <Filter className="w-5 h-5 text-primary" /> Advanced Filters
              </CardTitle>
              <CardDescription>Search and combine filters without refreshing the page.</CardDescription>
            </CardHeader>
            <CardContent className="relative z-10 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                <div className="space-y-2 md:col-span-2 xl:col-span-1">
                  <Label htmlFor="achievement-search">Search</Label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      id="achievement-search"
                      value={filters.search}
                      onChange={(e) => setFilters((prev) => ({ ...prev, search: e.target.value }))}
                      placeholder="Student, project, competition..."
                      className="pl-9"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Achievement Type</Label>
                  <Select value={filters.achievementType} onValueChange={(value) => setFilters((prev) => ({ ...prev, achievementType: value }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="All types" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All types</SelectItem>
                      {achievementTypes.map((type) => <SelectItem key={type} value={type}>{type}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Competition Level</Label>
                  <Select value={filters.competitionLevel} onValueChange={(value) => setFilters((prev) => ({ ...prev, competitionLevel: value }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="All levels" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All levels</SelectItem>
                      {competitionLevels.map((level) => <SelectItem key={level} value={level}>{level}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Contribution Domain</Label>
                  <Select value={filters.contributionDomain} onValueChange={(value) => setFilters((prev) => ({ ...prev, contributionDomain: value }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="All domains" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All domains</SelectItem>
                      {contributionDomains.map((domain) => <SelectItem key={domain} value={domain}>{domain}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Year</Label>
                  <Select value={filters.year} onValueChange={(value) => setFilters((prev) => ({ ...prev, year: value }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="All years" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All years</SelectItem>
                      {availableYears.map((year) => <SelectItem key={year} value={String(year)}>{year}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Team</Label>
                  <Input
                    value={filters.team}
                    onChange={(e) => setFilters((prev) => ({ ...prev, team: e.target.value }))}
                    placeholder="Team or student name"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Prize Winner</Label>
                  <Select value={filters.prizeWinner} onValueChange={(value) => setFilters((prev) => ({ ...prev, prizeWinner: value }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="All records" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All records</SelectItem>
                      <SelectItem value="true">Prize winners only</SelectItem>
                      <SelectItem value="false">No prize only</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-3 justify-between">
                <div className="text-sm text-muted-foreground">
                  {pagination.total} matching achievement{pagination.total === 1 ? '' : 's'} found.
                </div>
                <Button variant="outline" onClick={clearFilters} className="gap-2">
                  <X className="w-4 h-4" /> Clear Filters
                </Button>
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
            {analyticsCards.map((stat, index) => (
              <Card key={stat.label} className="group relative overflow-hidden border border-border/60 shadow-sm">
                <div className="absolute inset-0 bg-gradient-to-br from-background via-transparent to-primary/5 opacity-80 pointer-events-none" />
                <CardContent className="relative z-10 p-5 flex items-center gap-4">
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${stat.bg}`}>
                    <stat.icon className={`w-6 h-6 ${stat.color}`} />
                  </div>
                  <div className="min-w-0">
                    <p className="text-2xl font-bold text-foreground truncate">{stat.value}</p>
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">{stat.label}</p>
                  </div>
                  <span className="absolute -right-2 -bottom-4 text-7xl font-black text-foreground/5 select-none">{index + 1}</span>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        <div className="space-y-6">
          <Card className="border border-border/60 shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-xl">
                <TrendingUp className="w-5 h-5 text-primary" /> IDEA Hub Impact
              </CardTitle>
              <CardDescription>Contribution analytics from achievement records.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {[
                ['Workspace Support Count', contributionAnalytics?.workspaceSupportCount ?? 0],
                ['Mentorship Count', contributionAnalytics?.mentorshipCount ?? 0],
                ['Prototype Development Count', contributionAnalytics?.prototypeDevelopmentCount ?? 0],
                ['Testing Facility Usage', contributionAnalytics?.testingFacilityUsage ?? 0],
                ['Competition Registration Support', contributionAnalytics?.competitionRegistrationSupport ?? 0],
                ['Industry Mentoring Support', contributionAnalytics?.industryMentoringSupport ?? 0],
              ].map(([label, value]) => (
                <div key={label as string} className="flex items-center justify-between rounded-xl border border-border/60 bg-muted/20 px-4 py-3">
                  <span className="text-sm text-muted-foreground">{label as string}</span>
                  <span className="text-lg font-bold text-foreground">{value as number}</span>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card className="border border-border/60 shadow-sm">
            <CardHeader>
              <CardTitle className="text-xl flex items-center gap-2"><Banknote className="w-5 h-5 text-primary" /> Prize Money</CardTitle>
              <CardDescription>Summary from prize analytics.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {prizeCards.map((item) => (
                <div key={item.label} className="flex items-center justify-between rounded-xl border border-border/60 bg-muted/20 px-4 py-3">
                  <span className="text-sm text-muted-foreground">{item.label}</span>
                  <span className="text-sm font-semibold text-foreground">{item.value}</span>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </section>

      <section className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <Card className="xl:col-span-2 border border-border/60 shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-xl">
              <Layers3 className="w-5 h-5 text-primary" /> Prize Distribution Analytics
            </CardTitle>
            <CardDescription>Year-wise, competition-wise, and type-wise prize views.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="rounded-2xl border border-border/60 p-4 bg-background">
                <p className="mb-3 text-sm font-semibold text-foreground">Year-wise Prize Distribution</p>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={prizeChartData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="year" />
                      <YAxis />
                      <Tooltip formatter={(value) => `₹${Number(value).toLocaleString('en-IN')}`} />
                      <Line type="monotone" dataKey="totalPrizeMoney" stroke="#2563eb" strokeWidth={3} dot={{ r: 4 }} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="rounded-2xl border border-border/60 p-4 bg-background">
                <p className="mb-3 text-sm font-semibold text-foreground">Competition-wise Prize Distribution</p>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={competitionPrizeData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="label" />
                      <YAxis />
                      <Tooltip formatter={(value) => `₹${Number(value).toLocaleString('en-IN')}`} />
                      <Bar dataKey="totalPrizeMoney" fill="#10b981" radius={[8, 8, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="rounded-2xl border border-border/60 p-4 bg-background">
                <p className="mb-3 text-sm font-semibold text-foreground">Achievement Type Distribution</p>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={typeDistributionData} dataKey="value" nameKey="name" innerRadius={60} outerRadius={90} paddingAngle={4}>
                        {typeDistributionData.map((entry, index) => (
                          <Cell key={entry.name} fill={chartColors[index % chartColors.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="rounded-2xl border border-border/60 p-4 bg-background flex flex-col justify-center">
                <p className="mb-3 text-sm font-semibold text-foreground">Prize Highlights</p>
                <div className="space-y-3">
                  {prizeCards.map((item) => (
                    <div key={item.label} className="flex items-center justify-between rounded-xl border border-border/60 px-4 py-3">
                      <span className="text-sm text-muted-foreground">{item.label}</span>
                      <span className="text-sm font-semibold text-foreground">{item.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border border-border/60 shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-xl">
              <Calendar className="w-5 h-5 text-primary" /> Achievement Timeline
            </CardTitle>
            <CardDescription>Newest first, grouped by year.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {timeline.length === 0 ? (
              <p className="text-sm text-muted-foreground">No timeline data available yet.</p>
            ) : timeline.map((yearGroup) => (
              <div key={yearGroup.year} className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="h-3 w-3 rounded-full bg-primary" />
                  <h3 className="text-lg font-bold text-foreground">{yearGroup.year}</h3>
                </div>
                <div className="ml-1 border-l border-border/60 pl-5 space-y-3">
                  {yearGroup.achievements.slice(0, 4).map((item) => (
                    <Link key={item._id} to={`/achievements/${item._id}`} className="block group">
                      <div className="rounded-xl border border-border/60 bg-muted/20 px-4 py-3 transition-all group-hover:border-primary/30 group-hover:bg-primary/5">
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0">
                            <p className="font-semibold text-foreground line-clamp-2">{item.title}</p>
                            <p className="mt-1 text-xs text-muted-foreground">{item.achievementType || 'Achievement'} • {item.contributionDomain || 'General'}</p>
                          </div>
                          <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-primary shrink-0" />
                        </div>
                      </div>
                    </Link>
                  ))}
                  {yearGroup.achievements.length > 4 ? <p className="text-xs text-muted-foreground">+{yearGroup.achievements.length - 4} more</p> : null}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </section>

      {/* Achievements Grid */}
      {loading ? (
        <div className="py-20 text-center text-muted-foreground">Loading achievements...</div>
      ) : achievements.length === 0 ? (
        <p className="text-muted-foreground">No achievements match the current filters. {isCoordinator ? 'Create the first one.' : 'Check back later.'}</p>
      ) : (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {achievements.map((achievement) => {
            const contributionLabels = getContributionLabels(achievement.ideaHubContributions);
            return (
              <div 
                key={achievement._id} 
                className="group relative flex flex-col h-full bg-white dark:bg-zinc-900 rounded-[24px] border border-black/10 dark:border-white/10 ring-1 ring-inset ring-white/70 dark:ring-white/5 shadow-[0_2px_8px_rgba(0,0,0,0.04)] hover:shadow-[0_12px_24px_rgba(0,0,0,0.08)] transition-all duration-300 hover:-translate-y-1 cursor-pointer overflow-hidden"
              >
                <div className="p-3 pb-0">
                  <div className="relative aspect-[4/3] overflow-hidden rounded-[20px] bg-muted/30 shadow-inner">
                    {achievement.imageUrl ? (
                      <img 
                        src={achievement.imageUrl} 
                        alt={achievement.title} 
                        loading="lazy"
                        className="w-full h-full object-cover transition-transform duration-500 ease-out group-hover:scale-105"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-muted-foreground/20">
                        <Trophy className="w-16 h-16" />
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent pointer-events-none" />
                  </div>
                </div>

                <div className="flex flex-col flex-1 p-5 space-y-3">
                  <div className="flex flex-wrap gap-2">
                    {achievement.achievementType ? <Badge variant="secondary">{achievement.achievementType}</Badge> : null}
                    {achievement.competitionLevel ? <Badge variant="outline">{achievement.competitionLevel}</Badge> : null}
                    {achievement.contributionDomain ? <Badge variant="secondary">{achievement.contributionDomain}</Badge> : null}
                    {achievement.prizeAmount && achievement.prizeAmount > 0 ? <Badge className="bg-amber-500/10 text-amber-700 border-amber-500/20">Prize {formatCurrency(achievement.prizeAmount)}</Badge> : null}
                  </div>

                  <Link to={`/achievements/${achievement._id}`} className="block">
                    <h3 className="text-xl font-bold leading-tight text-foreground/90 group-hover:text-primary transition-colors line-clamp-2">
                      {achievement.title}
                    </h3>
                  </Link>

                  <div className="flex-1 text-sm text-muted-foreground/80 leading-relaxed">
                    <ReadMore text={achievement.description} limit={20} />
                  </div>

                  {contributionLabels.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                      {contributionLabels.slice(0, 4).map((label) => (
                        <span key={label} className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2.5 py-1 text-[11px] font-semibold text-emerald-700 dark:text-emerald-300">
                          <BadgeCheck className="w-3 h-3" /> {label}
                        </span>
                      ))}
                      {contributionLabels.length > 4 ? <span className="text-xs text-muted-foreground">+{contributionLabels.length - 4} more</span> : null}
                    </div>
                  ) : null}

                  <div className="pt-4 mt-auto flex items-center justify-between border-t border-black/5 dark:border-white/5">
                    <div className="flex items-center gap-3 text-xs font-medium text-muted-foreground">
                      <span className="flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 opacity-70" />
                        {new Date(achievement.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-xs text-muted-foreground/60">by {achievement.achievedBy}</span>
                    </div>
                  </div>

                  {isCoordinator && (
                    <div className="flex justify-end gap-2 pt-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button 
                        onClick={(e) => { e.stopPropagation(); startEdit(achievement); }}
                        className="p-2 h-8 w-8 inline-flex items-center justify-center rounded-full bg-secondary text-secondary-foreground hover:bg-secondary/80"
                        title="Edit"
                      >
                        <span className="sr-only">Edit</span>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"></path></svg>
                      </button>
                      <button 
                        onClick={async (e) => {
                          e.stopPropagation();
                          if (!confirm('Delete?')) return;
                          try {
                            await api.delete(`/achievements/${achievement._id}`);
                            setAchievements(achievements.filter((a) => a._id !== achievement._id));
                            toast.success('Deleted');
                            fetchAnalytics();
                          } catch {
                            toast.error('Error');
                          } 
                        }}
                        className="p-2 h-8 w-8 inline-flex items-center justify-center rounded-full bg-destructive/10 text-destructive hover:bg-destructive hover:text-white"
                        title="Delete"
                      >
                        <span className="sr-only">Delete</span>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"></path><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path></svg>
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {renderPagination()}
      </div>
      )}
    </div>
  );
};

export default Achievements;
