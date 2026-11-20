import React, { useCallback, useMemo, useRef, useState } from 'react';
import {
  Bell,
  BellOff,
  BookOpen,
  ChevronLeft,
  ChevronRight,
  Clock,
  Dices,
  Heart,
  Home,
  Info,
  Maximize2,
  Pause,
  Play,
  RotateCcw,
  Search,
  Settings,
  Smartphone,
  Trash2,
  Volume2,
  VolumeX,
  Wifi,
  X,
} from 'lucide-react';
import {
  CHEF_MASCOT_IMAGE,
  COOKING_PRESETS,
  COOKING_TIPS,
  RECIPES,
  Recipe,
  RecipeCategory,
} from './data/recipes';
import {
  KitchenUtensilsDoodle,
  LightbulbTipSvg,
  SimmeringPotSvg,
} from './components/Illustrations';
import {
  formatDurationClock,
  formatHistoryDate,
  formatReadableDuration,
  useCookingTimer,
} from './hooks/useCookingTimer';
import { ActiveTimerView } from './components/ActiveTimerView';
import { RecipeDetailView } from './components/RecipeDetailView';
import { DishImage } from './components/DishImage';

type NavTab = 'home' | 'recipes' | 'history' | 'about';
type RecipeFilter = 'All' | RecipeCategory | 'Saved';

const APP_LOGO_IMAGE = '/assets/aistudio/Logo_Cookora_afcb3987.jpg';

const FILTER_OPTIONS: RecipeFilter[] = [
  'All',
  'Chicken',
  'Pork',
  'Vegetables',
  'Seafood',
  'Noodles & Pasta',
  'Rice',
  'Saved',
];

export default function App() {
  const [showSplash, setShowSplash] = useState<boolean>(true);
  const [activeTab, setActiveTab] = useState<NavTab>('home');
  const [showTimerFocus, setShowTimerFocus] = useState<boolean>(false);
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null);
  const [recipeFilter, setRecipeFilter] = useState<RecipeFilter>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [showCustomTime, setShowCustomTime] = useState<boolean>(false);
  const [showSettingsSheet, setShowSettingsSheet] = useState<boolean>(false);
  const [customHours, setCustomHours] = useState<number>(0);
  const [customMinutes, setCustomMinutes] = useState<number>(10);
  const [customSeconds, setCustomSeconds] = useState<number>(0);
  const [tipIndex, setTipIndex] = useState<number>(0);
  const [toastMessage, setToastMessage] = useState<string>('');
  const [fullScreenDesktop, setFullScreenDesktop] = useState<boolean>(false);
  const [notificationStatus, setNotificationStatus] = useState<string>(() => {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      return Notification.permission;
    }
    return 'unsupported';
  });

  const scrollContainerRef = useRef<HTMLDivElement | null>(null);
  const searchInputRef = useRef<HTMLInputElement | null>(null);
  const toastTimerRef = useRef<number | null>(null);

  const scrollToTop = () => {
    scrollContainerRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const showToast = useCallback((message: string) => {
    setToastMessage(message);
    if (toastTimerRef.current !== null) {
      window.clearTimeout(toastTimerRef.current);
    }
    toastTimerRef.current = window.setTimeout(() => {
      setToastMessage('');
    }, 2500);
  }, []);

  const timer = useCookingTimer(showToast);

  const filteredRecipes = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return RECIPES.filter((recipe) => {
      if (recipeFilter === 'Saved' && !timer.favorites.includes(recipe.id)) {
        return false;
      }
      if (recipeFilter !== 'All' && recipeFilter !== 'Saved' && recipe.category !== recipeFilter) {
        return false;
      }
      if (!q) return true;
      return (
        recipe.name.toLowerCase().includes(q) ||
        recipe.category.toLowerCase().includes(q) ||
        recipe.ingredients.some((ing) => ing.toLowerCase().includes(q))
      );
    });
  }, [recipeFilter, searchQuery, timer.favorites]);

  const handleOpenTab = (tab: NavTab) => {
    setActiveTab(tab);
    setSelectedRecipe(null);
    setShowTimerFocus(false);
    setShowSettingsSheet(false);
    scrollToTop();
  };

  const handleSurpriseRecipe = () => {
    const pick = RECIPES[Math.floor(Math.random() * RECIPES.length)];
    setSelectedRecipe(pick);
    setShowTimerFocus(false);
    setActiveTab('recipes');
    scrollToTop();
  };

  const handleQuickChip = (minutes: number) => {
    timer.setDuration(minutes * 60, {
      label: 'Kitchen Timer',
      message: `${minutes} min selected. Ready when you are!`,
    });
  };

  const handlePresetClick = (label: string, minutes: number) => {
    timer.setDuration(minutes * 60, {
      label: `${label} Timer`,
      message: `${label} (${minutes} min) selected.`,
    });
    showToast(`${label} preset set to ${minutes} min.`);
  };

  const handleApplyCustomTime = () => {
    const total = customHours * 3600 + customMinutes * 60 + customSeconds;
    if (total <= 0) {
      showToast('Choose a time greater than zero.');
      return;
    }
    timer.setDuration(total, {
      label: 'Custom Timer',
      message: 'Custom timer set. Press Start when ready!',
    });
    setShowCustomTime(false);
    showToast(`Timer set to ${formatDurationClock(total)}.`);
  };

  const handleStartAndFocus = () => {
    timer.start();
    setShowTimerFocus(true);
    scrollToTop();
  };

  const handleCookRecipe = (recipe: Recipe) => {
    timer.setDuration(recipe.minutes * 60, {
      label: recipe.name,
      recipeId: recipe.id,
      autoStart: true,
    });
    setSelectedRecipe(null);
    setActiveTab('home');
    setShowTimerFocus(true);
    showToast(`Started ${recipe.minutes} min timer for ${recipe.name}!`);
    scrollToTop();
  };

  const handleRequestNotifications = async () => {
    if (typeof window === 'undefined' || !('Notification' in window)) {
      showToast('Browser notifications are not supported here.');
      return;
    }
    try {
      const result = await Notification.requestPermission();
      setNotificationStatus(result);
      if (result === 'granted') {
        showToast('Kitchen alerts enabled!');
      } else {
        showToast('Notification permission was not granted.');
      }
    } catch {
      showToast('Unable to update notification settings.');
    }
  };

  const nextTip = () => {
    setTipIndex((prev) => (prev + 1) % COOKING_TIPS.length);
  };

  const navItems: { id: NavTab; label: string; icon: React.ReactNode }[] = [
    { id: 'home', label: 'Home', icon: <Home className="w-5 h-5" /> },
    { id: 'recipes', label: 'Recipes', icon: <BookOpen className="w-5 h-5" /> },
    { id: 'history', label: 'History', icon: <Clock className="w-5 h-5" /> },
    { id: 'about', label: 'About', icon: <Info className="w-5 h-5" /> },
  ];

  // Matching the picture: Bottom bar stays visible on Home, Active Timer (Screen 2), Recipes (Screen 3), History (Screen 5), About (Screen 6).
  // Launch screen and Recipe Detail (Screen 4) hide the bottom bar for clean focus.
  const hideBottomTabBar = showSplash || selectedRecipe !== null;

  const phoneShellClass = fullScreenDesktop
    ? 'w-full max-w-md min-h-[100dvh] sm:min-h-[820px] sm:my-4 sm:rounded-[34px] sm:border-[6px] sm:border-white sm:shadow-[0_24px_60px_rgba(38,59,91,0.14)] bg-[#FBF9F5] flex flex-col relative overflow-hidden'
    : 'w-full sm:w-[390px] h-[100dvh] sm:h-[min(820px,93dvh)] sm:rounded-[40px] sm:border-[6px] sm:border-white bg-[#FBF9F5] flex flex-col relative overflow-hidden sm:shadow-[0_24px_60px_rgba(38,59,91,0.14)]';

  return (
    <div className="min-h-[100dvh] bg-[#E8EEF9] flex flex-col items-center justify-center sm:p-4 relative">
      {/* Subtle Desktop-Only Preview Toggle */}
      <div className="hidden sm:flex items-center gap-2 fixed top-4 right-4 z-50">
        <button
          type="button"
          onClick={() => setFullScreenDesktop((prev) => !prev)}
          className="min-h-[38px] px-3 py-1.5 rounded-full bg-white/90 backdrop-blur-md border border-[#DCE3F0] text-xs font-extrabold text-[#2B3F60] shadow-xs hover:bg-white inline-flex items-center gap-1.5 transition-colors"
        >
          {fullScreenDesktop ? (
            <>
              <Smartphone className="w-3.5 h-3.5" />
              Phone Frame
            </>
          ) : (
            <>
              <Maximize2 className="w-3.5 h-3.5" />
              Expand
            </>
          )}
        </button>
      </div>

      {/* Smartphone App Frame */}
      <div className={phoneShellClass}>
        {/* Clean iOS/Mobile Status Bar matching the picture */}
        {!fullScreenDesktop && (
          <div
            className="hidden sm:flex items-center justify-between px-6 pt-3 pb-1 bg-transparent text-[#263854] select-none shrink-0 z-20"
            aria-hidden="true"
          >
            <span className="text-xs font-black tracking-tight">9:41</span>
            <div className="flex items-center gap-1.5">
              <div className="flex items-end gap-[1.5px] h-2.5">
                <span className="w-[2.5px] h-1 bg-[#263854] rounded-full" />
                <span className="w-[2.5px] h-1.5 bg-[#263854] rounded-full" />
                <span className="w-[2.5px] h-2 bg-[#263854] rounded-full" />
                <span className="w-[2.5px] h-2.5 bg-[#263854] rounded-full" />
              </div>
              <Wifi className="w-3.5 h-3.5 stroke-[2.3]" />
              <div className="w-5 h-2.5 rounded-[3px] border border-[#263854] p-[1px] flex items-center">
                <div className="w-3.5 h-full bg-[#263854] rounded-[1px]" />
              </div>
            </div>
          </div>
        )}

        {/* Scrollable Screen Body */}
        <div ref={scrollContainerRef} className="flex-1 overflow-y-auto mobile-scroll relative">
          {/* LAUNCH / WELCOME DISPLAY (shown first when opening the app) */}
          {showSplash ? (
            <section
              aria-label="Welcome to Cookora"
              className="relative min-h-full flex flex-col justify-between bg-[#FBF9F5] px-6 pt-8 pb-8 overflow-hidden"
            >
              {/* Soft Pastel Blue Cloud Waves */}
              <svg
                viewBox="0 0 400 180"
                preserveAspectRatio="none"
                className="pointer-events-none absolute inset-x-0 top-0 w-full h-40 text-[#E8EFFD]"
                aria-hidden="true"
              >
                <path
                  fill="currentColor"
                  d="M0,0 L400,0 L400,105 C325,132 245,86 165,112 C95,135 45,102 0,120 Z"
                />
              </svg>
              <svg
                viewBox="0 0 400 160"
                preserveAspectRatio="none"
                className="pointer-events-none absolute inset-x-0 bottom-0 w-full h-36 text-[#E8EFFD]"
                aria-hidden="true"
              >
                <path
                  fill="currentColor"
                  d="M0,48 C75,18 155,62 235,34 C308,10 356,36 400,22 L400,160 L0,160 Z"
                />
              </svg>

              <div className="relative z-10 flex justify-center pt-4">
                <span className="text-xs font-extrabold tracking-wide text-[#4C5C78]">
                  Cook · Timer · Enjoy ♡
                </span>
              </div>

              {/* Centered Official App Logo Icon + Welcome Title */}
              <div className="relative z-10 my-auto flex flex-col items-center text-center py-4">
                <div className="w-44 h-44 rounded-[38px] overflow-hidden bg-white border-4 border-white shadow-[0_18px_42px_rgba(38,59,91,0.15)] mb-6">
                  <img
                    src={APP_LOGO_IMAGE}
                    alt="Cookora Timer App Logo"
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover"
                  />
                </div>

                <h1 className="text-[28px] font-black text-[#2B3F60] tracking-tight leading-tight">
                  Cookora Timer
                </h1>
                <p className="mt-2.5 text-sm font-bold text-[#52607A] leading-relaxed max-w-[260px]">
                  Your cozy kitchen timer and everyday Filipino meal companion.
                </p>
              </div>

              {/* Bottom Thumb-Zone Launch Buttons */}
              <div className="relative z-10 space-y-2.5">
                <button
                  type="button"
                  onClick={() => {
                    setShowSplash(false);
                    setActiveTab('home');
                  }}
                  className="w-full min-h-[50px] px-6 py-3 rounded-full bg-[#2B3F60] hover:bg-[#385078] text-white font-black text-sm inline-flex items-center justify-center gap-2 shadow-[0_8px_20px_rgba(43,63,96,0.22)] active:scale-[0.98] transition-all"
                >
                  Let&apos;s Cook!
                  <ChevronRight className="w-4 h-4" />
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setShowSplash(false);
                    setActiveTab('recipes');
                  }}
                  className="w-full min-h-[46px] px-6 py-2.5 rounded-full bg-[#FFE39B] hover:bg-[#FFD877] text-[#2B3F60] font-black text-sm inline-flex items-center justify-center gap-2 active:scale-[0.98] transition-all"
                >
                  <BookOpen className="w-4 h-4" />
                  Browse Recipes
                </button>

                <p className="text-center text-[11px] font-bold text-[#657289] pt-2">
                  Designed &amp; Developed by Jane Nicole Barquilla
                </p>
              </div>
            </section>
          ) : /* SCREEN 2: Active Kitchen Timer */
          showTimerFocus ? (
            <ActiveTimerView
              remaining={timer.remaining}
              initialDuration={timer.initialDuration}
              isRunning={timer.isRunning}
              isAlarming={timer.isAlarming}
              activeLabel={timer.activeLabel}
              statusMessage={timer.statusMessage}
              soundEnabled={timer.soundEnabled}
              onToggleSound={() => timer.setSoundEnabled((prev) => !prev)}
              onBack={() => setShowTimerFocus(false)}
              onStart={timer.start}
              onPause={timer.pause}
              onReset={timer.reset}
              onStopAlarm={timer.stopAlarm}
              onAdjustMinutes={timer.adjustMinutes}
            />
          ) : selectedRecipe ? (
            /* SCREEN 4: Recipe Detail */
            <RecipeDetailView
              recipe={selectedRecipe}
              isFavorite={timer.favorites.includes(selectedRecipe.id)}
              onToggleFavorite={timer.toggleFavorite}
              onBack={() => setSelectedRecipe(null)}
              onCookRecipe={handleCookRecipe}
            />
          ) : (
            <>
              {/* SCREEN 1: HOME */}
              {activeTab === 'home' && (
                <div className="relative pb-6">
                  {/* Soft Pastel Blue Cloud Wave across Top Illustration */}
                  <div
                    className="pointer-events-none absolute inset-x-0 top-0 h-[320px] overflow-hidden"
                    aria-hidden="true"
                  >
                    <svg
                      viewBox="0 0 400 320"
                      preserveAspectRatio="none"
                      className="w-full h-full"
                    >
                      <path
                        fill="#E8EFFD"
                        d="M0,78 C55,58 105,94 172,72 C240,50 295,62 400,46 L400,240 C320,255 245,228 170,248 C95,268 45,244 0,258 Z"
                      />
                    </svg>
                  </div>

                  <div className="relative z-10 px-4 pt-1 space-y-3.5">
                    {/* Top Brand Header matching Screen 1 */}
                    <header className="flex items-center justify-between gap-2">
                      <button
                        type="button"
                        onClick={() => setShowSplash(true)}
                        className="w-10 h-10 rounded-xl overflow-hidden border-2 border-white shadow-xs shrink-0 hover:scale-105 transition-transform"
                        aria-label="View Cookora welcome screen"
                        title="Cookora Welcome Display"
                      >
                        <img
                          src={APP_LOGO_IMAGE}
                          alt="Cookora Logo"
                          referrerPolicy="no-referrer"
                          className="w-full h-full object-cover"
                        />
                      </button>

                      <div className="text-center">
                        <h1 className="text-xl font-black text-[#2B3F60] leading-none tracking-tight">
                          Cookora
                        </h1>
                        <p className="text-[11px] font-bold text-[#4C5C78] mt-0.5">
                          Cook · Timer · Enjoy ♡
                        </p>
                      </div>

                      <button
                        type="button"
                        onClick={() => setShowSettingsSheet(true)}
                        className="min-h-[40px] min-w-[40px] inline-flex items-center justify-center rounded-full text-[#2B3F60] hover:bg-white/70 transition-colors"
                        aria-label="Open timer settings"
                      >
                        <Settings className="w-5 h-5" />
                      </button>
                    </header>

                    {/* Seamless Illustrated Chef + Speech Bubble + Sparkles (No Card Box!) */}
                    <section className="relative pt-1">
                      <div className="flex items-center justify-between gap-1">
                        {/* Left speech bubble */}
                        <div className="relative z-10 flex-1 pl-1 pt-6">
                          <div className="relative bg-white/95 rounded-2xl rounded-br-xs px-3.5 py-2.5 shadow-[0_4px_14px_rgba(38,59,91,0.06)] border border-[#E7ECF6] max-w-[175px]">
                            <p className="text-xs font-black text-[#2B3F60] leading-snug text-center">
                              What would you like to cook today?
                            </p>
                          </div>
                          {/* Cute hand-drawn sparkles */}
                          <span
                            className="inline-block text-[#F4B400] text-sm font-black ml-6 mt-1 select-none"
                            aria-hidden="true"
                          >
                            ✦
                          </span>
                        </div>

                        {/* Right seamless chibi chef girl */}
                        <div className="relative w-[164px] h-[156px] shrink-0 -mr-1">
                          <img
                            src={CHEF_MASCOT_IMAGE}
                            alt="Cookora chibi chef holding a wooden spoon"
                            referrerPolicy="no-referrer"
                            className="w-full h-full object-contain mix-blend-multiply [mask-image:radial-gradient(ellipse_at_center,black_62%,transparent_98%)]"
                          />
                        </div>
                      </div>

                      {/* Full-width Butter-Yellow Surprise Me Pill */}
                      <button
                        type="button"
                        onClick={handleSurpriseRecipe}
                        className="relative z-10 -mt-2 w-full min-h-[46px] px-5 py-2.5 rounded-2xl bg-[#FFE39B] hover:bg-[#FFD877] text-[#2B3F60] font-black text-sm inline-flex items-center justify-center gap-2 shadow-[0_4px_14px_rgba(255,227,155,0.55)] active:scale-[0.98] transition-all"
                      >
                        <Dices className="w-4 h-4" />
                        Surprise Me!
                      </button>
                    </section>

                    {/* Clean White Kitchen Timer Card matching Screen 1 */}
                    <section
                      aria-label="Kitchen Timer"
                      className="bg-white rounded-[26px] border border-[#E7EBF2] px-4 py-4 shadow-[0_8px_24px_rgba(38,59,91,0.06)]"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2 min-w-0">
                          <Clock className="w-5 h-5 text-[#2B3F60] shrink-0" />
                          <h2 className="text-[15px] font-black text-[#2B3F60] truncate">
                            {timer.activeLabel}
                          </h2>
                        </div>
                        <button
                          type="button"
                          onClick={() => setShowCustomTime((prev) => !prev)}
                          className="text-[11px] font-extrabold text-[#5D697E] hover:text-[#2B3F60] px-2 py-1 rounded-lg transition-colors"
                        >
                          {showCustomTime ? 'Close' : 'Custom'}
                        </button>
                      </div>

                      {/* Open Clean Digital Display (no inner grey box) */}
                      <button
                        type="button"
                        onClick={() => setShowTimerFocus(true)}
                        className="w-full py-2.5 text-center rounded-2xl hover:bg-[#F9FAFC] transition-colors"
                        title="Tap to open circular timer view"
                      >
                        <div className="font-timer text-[42px] font-black tracking-tight text-[#2B3F60] leading-none">
                          {formatDurationClock(timer.remaining)}
                        </div>
                      </button>

                      {/* 1 min | 5 min | 10 min Row */}
                      <div className="grid grid-cols-3 gap-2.5 mt-1">
                        {[1, 5, 10].map((mins) => {
                          const isSelected = timer.remaining === mins * 60 && !timer.isRunning;
                          return (
                            <button
                              key={mins}
                              type="button"
                              onClick={() => handleQuickChip(mins)}
                              className={`min-h-[38px] px-3 py-1.5 rounded-full text-xs font-extrabold transition-colors whitespace-nowrap ${
                                isSelected
                                  ? 'bg-[#FFE39B] text-[#2B3F60]'
                                  : 'bg-[#F1F2F6] text-[#2B3F60] hover:bg-[#E7E9F0]'
                              }`}
                            >
                              {mins} min
                            </button>
                          );
                        })}
                      </div>

                      {/* Expandable Custom Time Picker */}
                      {showCustomTime && (
                        <div className="mt-3 p-3 rounded-2xl bg-[#FBF9F5] border border-[#EAE6DF] grid grid-cols-3 gap-2">
                          <label className="flex flex-col gap-1 text-center">
                            <span className="text-[10px] font-extrabold text-[#657289]">Hours</span>
                            <select
                              value={customHours}
                              onChange={(e) => setCustomHours(Number(e.target.value))}
                              className="min-h-[38px] rounded-xl border border-[#DDD7CE] bg-white px-1 text-center font-bold text-xs text-[#2B3F60]"
                              aria-label="Hours"
                            >
                              {Array.from({ length: 24 }, (_, i) => (
                                <option key={i} value={i}>
                                  {String(i).padStart(2, '0')}
                                </option>
                              ))}
                            </select>
                          </label>
                          <label className="flex flex-col gap-1 text-center">
                            <span className="text-[10px] font-extrabold text-[#657289]">
                              Minutes
                            </span>
                            <select
                              value={customMinutes}
                              onChange={(e) => setCustomMinutes(Number(e.target.value))}
                              className="min-h-[38px] rounded-xl border border-[#DDD7CE] bg-white px-1 text-center font-bold text-xs text-[#2B3F60]"
                              aria-label="Minutes"
                            >
                              {Array.from({ length: 60 }, (_, i) => (
                                <option key={i} value={i}>
                                  {String(i).padStart(2, '0')}
                                </option>
                              ))}
                            </select>
                          </label>
                          <label className="flex flex-col gap-1 text-center">
                            <span className="text-[10px] font-extrabold text-[#657289]">
                              Seconds
                            </span>
                            <select
                              value={customSeconds}
                              onChange={(e) => setCustomSeconds(Number(e.target.value))}
                              className="min-h-[38px] rounded-xl border border-[#DDD7CE] bg-white px-1 text-center font-bold text-xs text-[#2B3F60]"
                              aria-label="Seconds"
                            >
                              {Array.from({ length: 60 }, (_, i) => (
                                <option key={i} value={i}>
                                  {String(i).padStart(2, '0')}
                                </option>
                              ))}
                            </select>
                          </label>
                          <button
                            type="button"
                            onClick={handleApplyCustomTime}
                            className="col-span-3 min-h-[38px] px-4 py-1.5 rounded-xl bg-[#2B3F60] text-white font-extrabold text-xs hover:bg-[#385078] transition-colors"
                          >
                            Apply Custom Time
                          </button>
                        </div>
                      )}

                      {/* Primary Full-Width Navy Start Pill */}
                      <div className="mt-3.5 space-y-2">
                        {timer.isAlarming && (
                          <button
                            type="button"
                            onClick={timer.stopAlarm}
                            className="w-full min-h-[42px] px-4 py-2 rounded-full bg-[#FFE39B] text-[#2B3F60] font-black text-xs inline-flex items-center justify-center gap-2"
                          >
                            <BellOff className="w-4 h-4" />
                            Stop Alarm
                          </button>
                        )}

                        {!timer.isRunning ? (
                          <button
                            type="button"
                            onClick={handleStartAndFocus}
                            className="w-full min-h-[46px] px-5 py-2.5 rounded-full bg-[#2B3F60] text-white font-black text-sm inline-flex items-center justify-center gap-2 shadow-sm hover:bg-[#385078] active:scale-[0.98] transition-all"
                          >
                            <Play className="w-4 h-4 fill-current" />
                            Start
                          </button>
                        ) : (
                          <div className="grid grid-cols-2 gap-2">
                            <button
                              type="button"
                              onClick={timer.pause}
                              className="min-h-[44px] px-4 py-2 rounded-full bg-[#DCE6FA] text-[#2B3F60] font-extrabold text-xs inline-flex items-center justify-center gap-1.5"
                            >
                              <Pause className="w-4 h-4 fill-current" />
                              Pause
                            </button>
                            <button
                              type="button"
                              onClick={() => setShowTimerFocus(true)}
                              className="min-h-[44px] px-4 py-2 rounded-full bg-[#2B3F60] text-white font-extrabold text-xs inline-flex items-center justify-center gap-1.5"
                            >
                              <Clock className="w-3.5 h-3.5" />
                              Timer View
                            </button>
                          </div>
                        )}
                      </div>
                    </section>

                    {/* Scrollable Below-Fold Quick Presets */}
                    <section className="pt-1">
                      <div className="flex items-center justify-between px-1 mb-2">
                        <h2 className="text-xs font-black text-[#2B3F60]">Quick Presets</h2>
                        <span className="text-[11px] font-bold text-[#657289]">Swipe →</span>
                      </div>
                      <div className="flex gap-2 overflow-x-auto pb-1 mobile-scroll">
                        {COOKING_PRESETS.map((preset) => (
                          <button
                            key={preset.id}
                            type="button"
                            onClick={() => handlePresetClick(preset.label, preset.minutes)}
                            className={`${preset.bgClass} min-w-[82px] rounded-2xl p-2.5 flex flex-col items-center justify-center text-center shrink-0 active:scale-[0.97] transition-transform`}
                          >
                            <span className="text-xl mb-1" aria-hidden="true">
                              {preset.emoji}
                            </span>
                            <span className="text-[11px] font-black text-[#2B3F60] leading-tight">
                              {preset.label}
                            </span>
                            <span className="text-[10px] font-bold text-[#505D74] mt-0.5">
                              {preset.minutes} min
                            </span>
                          </button>
                        ))}
                      </div>
                    </section>
                  </div>
                </div>
              )}

              {/* SCREEN 3: RECIPES */}
              {activeTab === 'recipes' && (
                <div className="px-4 pt-1 pb-5 space-y-3.5">
                  <header className="flex items-center justify-between gap-2">
                    <button
                      type="button"
                      onClick={() => handleOpenTab('home')}
                      className="min-h-[40px] min-w-[40px] inline-flex items-center justify-center rounded-2xl text-[#2B3F60] hover:bg-white/70"
                      aria-label="Back to Home"
                    >
                      <ChevronLeft className="w-5 h-5" />
                    </button>
                    <h1 className="text-base font-black text-[#2B3F60]">Recipes</h1>
                    <button
                      type="button"
                      onClick={() => searchInputRef.current?.focus()}
                      className="min-h-[40px] min-w-[40px] inline-flex items-center justify-center rounded-2xl text-[#2B3F60] hover:bg-white/70"
                      aria-label="Focus search bar"
                    >
                      <Search className="w-5 h-5" />
                    </button>
                  </header>

                  {/* Search Input */}
                  <div className="relative">
                    <Search className="w-4 h-4 text-[#7A8499] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <input
                      ref={searchInputRef}
                      type="search"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Search for a recipe..."
                      aria-label="Search recipes"
                      className="w-full min-h-[42px] pl-10 pr-9 py-2 rounded-2xl bg-[#EEF0F4] text-xs font-bold text-[#2B3F60] placeholder:text-[#7A8499] focus:outline-2 focus:outline-[#2B3F60]"
                    />
                    {searchQuery && (
                      <button
                        type="button"
                        onClick={() => setSearchQuery('')}
                        className="min-h-[34px] min-w-[34px] absolute right-1 top-1/2 -translate-y-1/2 inline-flex items-center justify-center rounded-xl text-[#5D697E]"
                        aria-label="Clear search"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    )}
                  </div>

                  {/* Category Tabs matching Screen 3 */}
                  <div
                    className="flex items-center gap-1.5 overflow-x-auto pb-0.5 mobile-scroll"
                    role="tablist"
                    aria-label="Recipe categories"
                  >
                    {FILTER_OPTIONS.map((category) => {
                      const active = recipeFilter === category;
                      return (
                        <button
                          key={category}
                          type="button"
                          role="tab"
                          aria-selected={active}
                          onClick={() => setRecipeFilter(category)}
                          className={`min-h-[34px] px-3.5 py-1 rounded-full text-xs font-extrabold transition-colors whitespace-nowrap shrink-0 ${
                            active
                              ? 'bg-[#2B3F60] text-white'
                              : 'text-[#4C5C78] hover:bg-white/70'
                          }`}
                        >
                          {category === 'Saved'
                            ? `Saved (${timer.favorites.length})`
                            : category}
                        </button>
                      );
                    })}
                  </div>

                  {/* 2-Column Recipe Grid matching Screen 3 */}
                  {filteredRecipes.length > 0 ? (
                    <div className="grid grid-cols-2 gap-3">
                      {filteredRecipes.map((recipe) => {
                        const isFav = timer.favorites.includes(recipe.id);
                        return (
                          <article
                            key={recipe.id}
                            className="relative bg-white rounded-2xl border border-[#EDEAE4] overflow-hidden shadow-[0_3px_12px_rgba(38,59,91,0.04)] flex flex-col"
                          >
                            <button
                              type="button"
                              onClick={() => setSelectedRecipe(recipe)}
                              className="text-left flex-1 flex flex-col"
                            >
                              <div className="aspect-[4/3] w-full overflow-hidden bg-[#F2EADC]">
                                <DishImage
                                  src={recipe.image}
                                  alt={recipe.name}
                                  className="w-full h-full object-cover"
                                />
                              </div>
                              <div className="p-2.5 flex-1 flex flex-col justify-between">
                                <h2 className="text-xs font-black text-[#2B3F60] leading-snug line-clamp-2">
                                  {recipe.name}
                                </h2>
                                <p className="mt-1 text-[11px] font-bold text-[#657289] inline-flex items-center gap-1">
                                  <Clock className="w-3 h-3 shrink-0" />
                                  <span>{recipe.timeLabel} →</span>
                                </p>
                              </div>
                            </button>

                            <button
                              type="button"
                              onClick={() => timer.toggleFavorite(recipe.id)}
                              className="absolute top-1.5 right-1.5 min-h-[32px] min-w-[32px] rounded-full bg-white/85 backdrop-blur-xs flex items-center justify-center shadow-xs"
                              aria-label={
                                isFav
                                  ? `Remove ${recipe.name} from saved recipes`
                                  : `Save ${recipe.name}`
                              }
                            >
                              <Heart
                                className={`w-3.5 h-3.5 ${
                                  isFav ? 'fill-[#E05353] text-[#E05353]' : 'text-[#2B3F60]'
                                }`}
                              />
                            </button>
                          </article>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="bg-white rounded-2xl border border-[#EAE6DF] p-6 text-center">
                      <p className="text-sm font-extrabold text-[#2B3F60]">
                        No matching recipes found
                      </p>
                      <button
                        type="button"
                        onClick={() => {
                          setRecipeFilter('All');
                          setSearchQuery('');
                        }}
                        className="mt-3 min-h-[38px] px-4 py-1.5 rounded-full bg-[#FFE39B] text-[#2B3F60] font-extrabold text-xs"
                      >
                        Show All Recipes
                      </button>
                    </div>
                  )}

                  <button
                    type="button"
                    onClick={handleSurpriseRecipe}
                    className="w-full min-h-[44px] px-4 py-2.5 rounded-2xl bg-[#FFE39B] hover:bg-[#FFD877] text-[#2B3F60] font-black text-xs inline-flex items-center justify-center gap-2 shadow-2xs transition-colors"
                  >
                    <Dices className="w-4 h-4" />
                    More Suggestions ♡
                  </button>
                </div>
              )}

              {/* SCREEN 5: HISTORY */}
              {activeTab === 'history' && (
                <div className="px-4 pt-2 pb-5 space-y-4">
                  {/* Top Cooking Tip Card matching Screen 5 */}
                  <section className="bg-[#DFE9FF] rounded-[24px] p-4 flex items-center gap-3 shadow-2xs">
                    <LightbulbTipSvg className="w-16 h-16 shrink-0" />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-2">
                        <h1 className="text-base font-black text-[#2B3F60]">Cooking Tip!</h1>
                        <button
                          type="button"
                          onClick={nextTip}
                          className="px-2.5 py-0.5 rounded-full bg-white/75 text-[10px] font-extrabold text-[#2B3F60] shrink-0"
                        >
                          Next
                        </button>
                      </div>
                      <p className="mt-1 text-xs font-bold text-[#344767] leading-relaxed">
                        {COOKING_TIPS[tipIndex]}
                      </p>
                    </div>
                  </section>

                  {/* Your Cooking History List matching Screen 5 */}
                  <section>
                    <div className="flex items-center justify-between gap-2 mb-2.5 px-1">
                      <div className="flex items-center gap-1.5">
                        <Clock className="w-4 h-4 text-[#2B3F60]" />
                        <h2 className="text-sm font-black text-[#2B3F60]">Your Cooking History</h2>
                      </div>
                      {timer.history.length > 0 && (
                        <button
                          type="button"
                          onClick={timer.clearHistory}
                          className="text-xs font-extrabold text-[#5D697E] hover:text-[#2B3F60] inline-flex items-center gap-1"
                        >
                          <Trash2 className="w-3 h-3" />
                          Clear
                        </button>
                      )}
                    </div>

                    {timer.history.length === 0 ? (
                      <div className="bg-white rounded-2xl border border-[#EDEAE4] py-8 px-4 text-center">
                        <SimmeringPotSvg className="w-20 h-16 mx-auto mb-2" />
                        <p className="text-xs font-extrabold text-[#2B3F60]">
                          Your completed timers will appear here.
                        </p>
                        <p className="text-[11px] font-semibold text-[#657289] mt-1">
                          Finish a timer or cook a recipe to save your history!
                        </p>
                        <button
                          type="button"
                          onClick={() => handleOpenTab('recipes')}
                          className="mt-3.5 min-h-[38px] px-4 py-1.5 rounded-full bg-[#FFE39B] text-[#2B3F60] font-extrabold text-xs"
                        >
                          Browse Recipes
                        </button>
                      </div>
                    ) : (
                      <ul className="space-y-2.5">
                        {timer.history.map((entry) => {
                          const linkedRecipe = entry.recipeId
                            ? RECIPES.find((r) => r.id === entry.recipeId)
                            : undefined;

                          return (
                            <li key={entry.id}>
                              <button
                                type="button"
                                onClick={() => {
                                  if (linkedRecipe) {
                                    setSelectedRecipe(linkedRecipe);
                                  } else {
                                    timer.setDuration(entry.duration, { label: entry.label });
                                    setActiveTab('home');
                                    setShowTimerFocus(true);
                                  }
                                }}
                                className="w-full min-h-[64px] p-2.5 rounded-2xl bg-white border border-[#EDEAE4] shadow-[0_2px_10px_rgba(38,59,91,0.03)] hover:bg-[#FAF8F4] flex items-center gap-3 text-left transition-colors"
                              >
                                {linkedRecipe ? (
                                  <div className="w-16 h-12 rounded-xl overflow-hidden bg-[#F2EADC] shrink-0">
                                    <DishImage
                                      src={linkedRecipe.image}
                                      alt={linkedRecipe.name}
                                      className="w-full h-full object-cover"
                                    />
                                  </div>
                                ) : (
                                  <div className="w-16 h-12 rounded-xl bg-[#EEF3FF] text-[#2B3F60] flex items-center justify-center shrink-0">
                                    <Clock className="w-5 h-5" />
                                  </div>
                                )}

                                <div className="min-w-0 flex-1">
                                  <p className="text-xs font-black text-[#2B3F60] truncate">
                                    {entry.label}
                                  </p>
                                  <p className="text-[11px] font-bold text-[#657289] mt-0.5">
                                    {formatHistoryDate(entry.completedAt)} ·{' '}
                                    {formatReadableDuration(entry.duration)}
                                  </p>
                                </div>

                                <ChevronRight className="w-4 h-4 text-[#7D889E] shrink-0" />
                              </button>
                            </li>
                          );
                        })}
                      </ul>
                    )}
                  </section>
                </div>
              )}

              {/* SCREEN 6: ABOUT */}
              {activeTab === 'about' && (
                <div className="relative min-h-full flex flex-col justify-between bg-[#FBF9F5] overflow-hidden">
                  {/* Soft Pastel Blue Bottom Cloud Wave matching Screen 6 */}
                  <svg
                    viewBox="0 0 400 130"
                    preserveAspectRatio="none"
                    className="pointer-events-none absolute inset-x-0 bottom-0 w-full h-32 text-[#E8EFFD]"
                    aria-hidden="true"
                  >
                    <path
                      fill="currentColor"
                      d="M0,45 C75,15 150,55 230,30 C305,6 355,34 400,20 L400,130 L0,130 Z"
                    />
                  </svg>

                  <div className="relative z-10 px-5 pt-1 pb-4 flex-1 flex flex-col">
                    <header className="flex items-center justify-between gap-2">
                      <button
                        type="button"
                        onClick={() => handleOpenTab('home')}
                        className="min-h-[40px] min-w-[40px] inline-flex items-center justify-center rounded-2xl text-[#2B3F60] hover:bg-white/70"
                        aria-label="Back to Home"
                      >
                        <ChevronLeft className="w-5 h-5" />
                      </button>
                      <h1 className="text-base font-black text-[#2B3F60]">About</h1>
                      <div className="w-10" aria-hidden="true" />
                    </header>

                    {/* Centerpiece App Logo Icon */}
                    <div className="my-auto py-4 text-center flex flex-col items-center">
                      <div className="w-28 h-28 rounded-[26px] overflow-hidden bg-white border-4 border-white shadow-[0_12px_28px_rgba(38,59,91,0.14)] mb-3.5">
                        <img
                          src={APP_LOGO_IMAGE}
                          alt="Cookora Timer Logo"
                          referrerPolicy="no-referrer"
                          className="w-full h-full object-cover"
                        />
                      </div>

                      <h2 className="text-2xl font-black text-[#2B3F60] tracking-tight">
                        Cookora
                      </h2>
                      <p className="text-xs font-extrabold text-[#4C5C78] mt-1">
                        Cook · Timer · Enjoy ♡
                      </p>

                      <p className="mt-4 text-xs font-semibold text-[#3C485E] leading-relaxed max-w-[270px]">
                        Your cooking companion for everyday meals. Find recipes, set timers, and
                        make cooking easier and more enjoyable! ♡
                      </p>

                      <div className="mt-4">
                        <p className="text-[11px] font-bold text-[#657289]">
                          Designed &amp; Developed by
                        </p>
                        <p className="text-sm font-black text-[#2B3F60] mt-0.5">
                          Jane Nicole Barquilla
                        </p>
                      </div>
                    </div>

                    {/* Kitchen Utensils Doodles along the Bottom Wave */}
                    <div className="mt-auto flex justify-center pt-2">
                      <KitchenUtensilsDoodle className="w-60 h-16" />
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* Settings / Audio Sheet Modal (triggered by Gear Icon on Screen 1) */}
        {showSettingsSheet && (
          <div
            className="absolute inset-0 z-40 bg-[#263854]/35 backdrop-blur-[2px] flex items-end justify-center"
            onClick={() => setShowSettingsSheet(false)}
          >
            <div
              className="w-full bg-[#FBF9F5] rounded-t-[28px] p-5 pb-7 shadow-xl border-t border-white space-y-4"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="w-10 h-1 rounded-full bg-[#D7D2C9] mx-auto" />
              <div className="flex items-center justify-between">
                <h2 className="text-base font-black text-[#2B3F60]">Timer Settings</h2>
                <button
                  type="button"
                  onClick={() => setShowSettingsSheet(false)}
                  className="min-h-[36px] min-w-[36px] rounded-full bg-[#EFECE6] text-[#2B3F60] inline-flex items-center justify-center"
                  aria-label="Close settings"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="bg-white rounded-2xl border border-[#EAE6DF] p-3.5 flex items-center justify-between gap-2">
                <div>
                  <p className="text-xs font-black text-[#2B3F60]">Completion Chime</p>
                  <p className="text-[11px] font-semibold text-[#657289]">
                    Ring softly when cooking finishes
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => timer.setSoundEnabled((prev) => !prev)}
                  className={`min-h-[38px] px-3.5 py-1.5 rounded-full text-xs font-extrabold inline-flex items-center gap-1.5 ${
                    timer.soundEnabled
                      ? 'bg-[#2B3F60] text-white'
                      : 'bg-[#F1F2F6] text-[#5D697E]'
                  }`}
                >
                  {timer.soundEnabled ? (
                    <>
                      <Volume2 className="w-3.5 h-3.5" /> On
                    </>
                  ) : (
                    <>
                      <VolumeX className="w-3.5 h-3.5" /> Muted
                    </>
                  )}
                </button>
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <button
                  type="button"
                  onClick={timer.testSound}
                  className="min-h-[42px] px-3 py-2 rounded-2xl bg-[#FFE39B] text-[#2B3F60] text-xs font-black inline-flex items-center justify-center gap-1.5"
                >
                  <Volume2 className="w-4 h-4" />
                  Test Chime
                </button>

                {notificationStatus !== 'unsupported' && (
                  <button
                    type="button"
                    onClick={handleRequestNotifications}
                    className="min-h-[42px] px-3 py-2 rounded-2xl bg-[#DCE6FA] text-[#2B3F60] text-xs font-black inline-flex items-center justify-center gap-1.5"
                  >
                    <Bell className="w-4 h-4" />
                    {notificationStatus === 'granted' ? 'Alerts Active' : 'Enable Alerts'}
                  </button>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Fixed Bottom Mobile Tab Bar matching the 6-screen mockup */}
        {!hideBottomTabBar && (
          <nav
            aria-label="Mobile navigation"
            className="h-[64px] pb-safe bg-[#FBF9F5]/95 backdrop-blur-md border-t border-[#EAE6DF] grid grid-cols-4 items-center px-2 shrink-0 z-20"
          >
            {navItems.map((item) => {
              const active = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => handleOpenTab(item.id)}
                  className="min-h-[44px] flex flex-col items-center justify-center gap-0.5 rounded-xl"
                  aria-current={active ? 'page' : undefined}
                >
                  <span
                    className={`w-9 h-7 rounded-xl flex items-center justify-center transition-colors ${
                      active ? 'bg-[#FFE39B] text-[#2B3F60]' : 'text-[#4C5C78]'
                    }`}
                  >
                    {item.icon}
                  </span>
                  <span
                    className={`text-[10px] tracking-tight ${
                      active ? 'font-black text-[#2B3F60]' : 'font-bold text-[#657289]'
                    }`}
                  >
                    {item.label}
                  </span>
                </button>
              );
            })}
          </nav>
        )}

        {/* Toast Feedback inside App Frame */}
        <div
          role="status"
          aria-live="polite"
          className={`absolute left-1/2 -translate-x-1/2 bottom-20 z-50 px-4 py-2 rounded-full bg-[#2B3F60] text-white text-xs font-extrabold shadow-lg transition-all duration-200 pointer-events-none whitespace-nowrap ${
            toastMessage ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-3'
          }`}
        >
          {toastMessage}
        </div>
      </div>
    </div>
  );
}
