/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useId, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Flame, 
  Settings2, 
  RotateCcw, 
  HelpCircle, 
  TrendingUp, 
  Clock, 
  Zap, 
  AlertCircle,
  Play,
  Square,
  Sparkles,
  Users,
  Minus,
  Plus,
  RefreshCw,
  Timer
} from 'lucide-react';

type Currency = 'INR' | 'USD';
type SalaryPeriod = 'annual' | 'monthly';

export default function App() {
  // Primary state from Version 1
  const [currency, setCurrency] = useState<Currency>('INR');
  const [period, setPeriod] = useState<SalaryPeriod>('annual');
  const [salaryInput, setSalaryInput] = useState<string>('1500000'); // default initial demo: 15 LPA

  // Editable working parameters (Default: 22 days/month, 8 hours/day)
  const [daysPerMonth, setDaysPerMonth] = useState<number>(22);
  const [hoursPerDay, setHoursPerDay] = useState<number>(8);
  const [showConfig, setShowConfig] = useState<boolean>(false);

  // Live burn ticking stopwatch from Version 1
  const [isLiveTickerActive, setIsLiveTickerActive] = useState<boolean>(false);
  const [liveSecondsElapsed, setLiveSecondsElapsed] = useState<number>(0);

  // Version 2: Meeting cost features
  const [meetingDuration, setMeetingDuration] = useState<number>(30); // minutes (15 to 480)
  const [attendees, setAttendees] = useState<number>(5); // stepper 1 to 25, default 5
  const [comparisonVariantIndex, setComparisonVariantIndex] = useState<number>(0);

  const salaryInputId = useId();

  // Reset live stopwatch when salary or parameters change
  useEffect(() => {
    setLiveSecondsElapsed(0);
  }, [salaryInput, currency, period, daysPerMonth, hoursPerDay]);

  // Live timer interval
  useEffect(() => {
    let interval: ReturnType<typeof setInterval> | null = null;
    if (isLiveTickerActive) {
      interval = setInterval(() => {
        setLiveSecondsElapsed(prev => prev + 1);
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isLiveTickerActive]);

  // Clean raw numeric input parsing
  const cleanSalaryString = salaryInput.trim().replace(/,/g, '');
  const isInputEmpty = cleanSalaryString === '';
  const parsedSalary = parseFloat(cleanSalaryString);
  const isInvalidOrZeroOrNegative = !isInputEmpty && (isNaN(parsedSalary) || parsedSalary <= 0);
  const isValidSalary = !isInputEmpty && !isInvalidOrZeroOrNegative && !isNaN(parsedSalary) && parsedSalary > 0;

  // Working hours calculation
  const safeDays = Math.max(1, daysPerMonth || 22);
  const safeHours = Math.max(0.5, hoursPerDay || 8);
  const workingHoursPerMonth = safeDays * safeHours;
  const workingHoursPerYear = safeDays * 12 * safeHours;

  // Rate calculations
  let hourlyRate = 0;
  let minuteRate = 0;
  let secondRate = 0;

  if (isValidSalary) {
    if (period === 'annual') {
      hourlyRate = parsedSalary / workingHoursPerYear;
    } else {
      hourlyRate = parsedSalary / workingHoursPerMonth;
    }
    minuteRate = hourlyRate / 60;
    secondRate = minuteRate / 60;
  }

  // Live burn accumulated value
  const liveBurnedAmount = secondRate * liveSecondsElapsed;

  // Meeting Burn Calculation (Version 2)
  // Assume all attendees have the same salary
  const totalMeetingBurn = isValidSalary ? minuteRate * meetingDuration * attendees : 0;

  // Format duration helper
  const formatDuration = (mins: number) => {
    if (mins < 60) return `${mins} mins`;
    const h = Math.floor(mins / 60);
    const m = mins % 60;
    if (m === 0) return `${h} hr${h > 1 ? 's' : ''}`;
    return `${h} hr${h > 1 ? 's' : ''} ${m}m`;
  };

  // Format currency helpers
  const formatCurrency = (val: number, minimumFractionDigits = 2, maximumFractionDigits = 2) => {
    if (currency === 'INR') {
      return new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR',
        minimumFractionDigits,
        maximumFractionDigits,
      }).format(val);
    } else {
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits,
        maximumFractionDigits,
      }).format(val);
    }
  };

  // Indian word conversion shorthand helper (Lakhs, Crores)
  const getIndianShorthand = (val: number) => {
    if (currency !== 'INR') return null;
    if (val >= 10000000) {
      return `${(val / 10000000).toFixed(2)} Crore${val >= 20000000 ? 's' : ''}`;
    }
    if (val >= 100000) {
      return `${(val / 100000).toFixed(2)} Lakh${val >= 200000 ? 's' : ''}`;
    }
    return null;
  };

  const getUsdShorthand = (val: number) => {
    if (currency !== 'USD') return null;
    if (val >= 1000000) {
      return `$${(val / 1000000).toFixed(2)}M`;
    }
    if (val >= 1000) {
      return `$${(val / 1000).toFixed(0)}k`;
    }
    return null;
  };

  // Comparisons generator for human comprehension of amount burned
  const getComparisonsList = (amount: number, curr: Currency): string[] => {
    if (amount <= 0) return ["That's totally free (0 burn)"];

    if (curr === 'INR') {
      if (amount < 200) {
        const chais = Math.max(2, Math.round(amount / 20));
        return [
          `That is ${chais} cups of hot cutting chai ☕`,
          `That is ${Math.max(2, Math.round(amount / 25))} crispy samosas 🥟`
        ];
      }
      if (amount < 1000) {
        const plates = Math.max(2, Math.round(amount / 200));
        return [
          `That is ${plates} plates of biryani 🍛`,
          `That is ${Math.max(1, Math.round(amount / 300))} cups of Starbucks coffee ☕`,
          `That is movie tickets with popcorn 🍿`
        ];
      }
      if (amount < 7000) {
        const biryaniCount = Math.max(3, Math.round(amount / 220));
        return [
          `That is ${biryaniCount} plates of biryani 🍛`,
          `That is a lavish buffet dinner for the team 🍽️`,
          `That is ${Math.max(2, Math.round(amount / 450))} gourmet pizzas 🍕`
        ];
      }
      if (amount < 15000) {
        const biryaniCount = Math.round(amount / 220);
        return [
          `That is ${biryaniCount} plates of biryani 🍛`,
          `That is a high-performance mechanical keyboard & mouse ⌨️`,
          `That is 10 months of all premium streaming subscriptions combined 🎬`
        ];
      }
      if (amount < 30000) {
        return [
          `That is a new air pod 🎧`,
          `That is ${Math.round(amount / 220)} plates of biryani 🍛`,
          `That is a premium ergonomic office chair 🪑`
        ];
      }
      if (amount < 80000) {
        return [
          `That is a weeked trip to goa 🏖️`,
          `That is a new air pod for everyone on the call 🎧`,
          `That is a 55-inch 4K Ultra HD Smart TV 📺`
        ];
      }
      if (amount < 170000) {
        return [
          `That is a brand new iPhone 16 Pro 📱`,
          `That is a weeked trip to goa with luxury flights & 5-star resort 🏖️`,
          `That is ${Math.round(amount / 220).toLocaleString('en-IN')} plates of biryani 🍛`
        ];
      }
      if (amount < 400000) {
        return [
          `That is a brand new Royal Enfield motorbike 🏍️`,
          `That is an exotic vacation in Bali for two 🌴`,
          `That is 6 weekend trips to Goa 🏖️`
        ];
      }
      if (amount < 1200000) {
        return [
          `That is a luxury trip to Switzerland and Paris for two ✈️`,
          `That is 4 brand new motorbikes 🏍️`,
          `That is ~${Math.round(amount / 220).toLocaleString('en-IN')} plates of biryani 🍛`
        ];
      }
      return [
        `That is a brand new compact SUV car 🚗`,
        `That is an entire year of prime apartment rent in Mumbai 🏙️`,
        `That is an angel investment seed ticket 💼`
      ];
    } else {
      // USD
      if (amount < 15) {
        const coffees = Math.max(1, Math.round(amount / 5));
        return [
          `That is ${coffees} iced lattes from Starbucks ☕`,
          `That is a bagel & artisanal coffee 🥯`
        ];
      }
      if (amount < 60) {
        const burritos = Math.max(2, Math.round(amount / 14));
        return [
          `That is ${burritos} loaded Chipotle bowls 🌯`,
          `That is movie tickets with large popcorn 🍿`
        ];
      }
      if (amount < 180) {
        return [
          `That is a prime dry-aged steakhouse dinner for two 🥩`,
          `That is ${Math.round(amount / 14)} loaded Chipotle bowls 🌯`,
          `That is a full year of Netflix and Spotify 🎵`
        ];
      }
      if (amount < 450) {
        return [
          `That is a new air pod 🎧`,
          `That is a round-trip weekend flight ticket ✈️`,
          `That is a premium mechanical keyboard & ultra-wide monitor 🖥️`
        ];
      }
      if (amount < 1400) {
        return [
          `That is a brand new iPhone 16 Pro 📱`,
          `That is a weekend trip to a Miami beach resort 🏖️`,
          `That is a top-of-the-line ergonomic Herman Miller chair 🪑`
        ];
      }
      if (amount < 4000) {
        return [
          `That is a weekend trip to Hawaii or Cabo 🏖️`,
          `That is a brand new MacBook Pro with M3 chip 💻`,
          `That is 2 brand new iPhone 16 Pro phones 📱`
        ];
      }
      if (amount < 12000) {
        return [
          `That is a two-week first-class European vacation ✈️`,
          `That is 4 high-end MacBook Pros 💻`,
          `That is a dependable used car 🚗`
        ];
      }
      return [
        `That is a brand new sedan or sports car 🚗`,
        `That is a full year of college tuition 🎓`,
        `That is a down payment on a house 🏡`
      ];
    }
  };

  const comparisons = getComparisonsList(totalMeetingBurn, currency);
  const activeComparison = comparisons[comparisonVariantIndex % comparisons.length] || comparisons[0];

  // Preset quick picks depending on currency & period
  const presets = currency === 'INR'
    ? (period === 'annual'
        ? [
            { label: '₹8 LPA', value: '800000' },
            { label: '₹15 LPA', value: '1500000' },
            { label: '₹25 LPA', value: '2500000' },
            { label: '₹40 LPA', value: '4000000' },
            { label: '₹75 LPA', value: '7500000' },
          ]
        : [
            { label: '₹50,000', value: '50000' },
            { label: '₹1 Lakh', value: '100000' },
            { label: '₹1.5 Lakhs', value: '150000' },
            { label: '₹2.5 Lakhs', value: '250000' },
            { label: '₹4 Lakhs', value: '400000' },
          ])
    : (period === 'annual'
        ? [
            { label: '$60k', value: '60000' },
            { label: '$95k', value: '95000' },
            { label: '$130k', value: '130000' },
            { label: '$180k', value: '180000' },
            { label: '$250k', value: '250000' },
          ]
        : [
            { label: '$5,000', value: '5000' },
            { label: '$8,000', value: '8000' },
            { label: '$12,000', value: '12000' },
            { label: '$16,000', value: '16000' },
            { label: '$22,000', value: '22000' },
          ]);

  // Handle currency toggle switch
  const handleCurrencyChange = (newCurrency: Currency) => {
    if (newCurrency === currency) return;
    setCurrency(newCurrency);
    if (newCurrency === 'USD') {
      if (period === 'annual') {
        setSalaryInput('110000');
      } else {
        setSalaryInput('9000');
      }
    } else {
      if (period === 'annual') {
        setSalaryInput('1500000');
      } else {
        setSalaryInput('125000');
      }
    }
  };

  // Handle frequency toggle switch
  const handlePeriodChange = (newPeriod: SalaryPeriod) => {
    if (newPeriod === period) return;
    setPeriod(newPeriod);
    const num = parseFloat(salaryInput.replace(/,/g, ''));
    if (!isNaN(num) && num > 0) {
      if (newPeriod === 'monthly' && period === 'annual') {
        setSalaryInput(Math.round(num / 12).toString());
      } else if (newPeriod === 'annual' && period === 'monthly') {
        setSalaryInput(Math.round(num * 12).toString());
      }
    }
  };

  const handleResetSchedule = () => {
    setDaysPerMonth(22);
    setHoursPerDay(8);
  };

  const isScheduleModified = daysPerMonth !== 22 || hoursPerDay !== 8;

  // Stepper handlers for attendees (1 to 25)
  const handleAttendeeChange = (delta: number) => {
    setAttendees(prev => Math.min(25, Math.max(1, prev + delta)));
  };

  return (
    <div className="min-h-screen bg-[#090a0f] text-zinc-100 flex flex-col selection:bg-orange-500 selection:text-white relative overflow-x-hidden">
      {/* Background ambient fire glow */}
      <div 
        aria-hidden="true" 
        className="pointer-events-none fixed -top-40 left-1/2 -translate-x-1/2 w-[720px] h-[480px] bg-gradient-to-b from-orange-500/15 via-orange-600/5 to-transparent blur-3xl opacity-75" 
      />

      {/* Top Bar Header */}
      <header className="w-full border-b border-zinc-800/80 bg-[#090a0f]/80 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <span className="flex items-center justify-center w-9 h-9 rounded-xl bg-orange-500/10 text-orange-500 border border-orange-500/30 text-xl shadow-[0_0_15px_rgba(249,115,22,0.25)]">
              🔥
            </span>
            <div className="flex flex-col">
              <span className="text-base sm:text-lg font-bold tracking-tight text-white flex items-center gap-1.5">
                Meeting Cost
              </span>
              <span className="text-[11px] text-zinc-400 font-medium hidden sm:inline">
                Live Salary Burn Rate Calculator
              </span>
            </div>
          </div>

          {/* Quick Schedule configuration badge */}
          <button
            type="button"
            onClick={() => setShowConfig(!showConfig)}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
              showConfig 
                ? 'bg-orange-500/15 border-orange-500/40 text-orange-400' 
                : isScheduleModified
                  ? 'bg-zinc-800/80 border-orange-500/40 text-zinc-200'
                  : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-zinc-200 hover:border-zinc-700'
            }`}
          >
            <Settings2 className="w-3.5 h-3.5" />
            <span>
              {safeDays}d / {safeHours}h work setup
              {isScheduleModified && <span className="ml-1 text-orange-400 font-bold">•</span>}
            </span>
          </button>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-4xl w-full mx-auto px-4 sm:px-6 py-6 sm:py-10 flex flex-col gap-6">
        
        {/* Intro Banner */}
        <div className="text-center sm:text-left space-y-1.5">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            How much cash is on the clock?
          </h1>
          <p className="text-sm text-zinc-400">
            See your exact hourly and per-minute burn rate computed in real-time as you type.
          </p>
        </div>

        {/* Collapsible Working Schedule Settings (Version 1 - Kept Unchanged) */}
        <AnimatePresence>
          {showConfig && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden"
            >
              <div className="bg-zinc-900/90 border border-zinc-800 rounded-2xl p-5 backdrop-blur-sm space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Settings2 className="w-4 h-4 text-orange-400" />
                    <h3 className="text-sm font-semibold text-zinc-200">
                      Working Schedule Assumptions
                    </h3>
                  </div>
                  {isScheduleModified && (
                    <button
                      type="button"
                      onClick={handleResetSchedule}
                      className="text-xs text-orange-400 hover:text-orange-300 flex items-center gap-1 font-medium transition-colors"
                    >
                      <RotateCcw className="w-3 h-3" />
                      Reset to 22d / 8h
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-zinc-400 flex items-center justify-between">
                      <span>Working days per month</span>
                      <span className="text-orange-400 font-mono font-semibold">{safeDays} days</span>
                    </label>
                    <div className="flex items-center gap-2">
                      <input
                        type="range"
                        min="1"
                        max="31"
                        value={daysPerMonth}
                        onChange={(e) => setDaysPerMonth(parseInt(e.target.value) || 1)}
                        className="w-full accent-orange-500 bg-zinc-800 h-2 rounded-lg cursor-pointer"
                      />
                      <input
                        type="number"
                        min="1"
                        max="31"
                        value={daysPerMonth}
                        onChange={(e) => setDaysPerMonth(parseInt(e.target.value) || 1)}
                        className="w-16 px-2.5 py-1.5 bg-zinc-950 border border-zinc-800 rounded-lg text-sm text-center font-mono text-zinc-100 focus:outline-none focus:border-orange-500"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-zinc-400 flex items-center justify-between">
                      <span>Working hours per day</span>
                      <span className="text-orange-400 font-mono font-semibold">{safeHours} hrs</span>
                    </label>
                    <div className="flex items-center gap-2">
                      <input
                        type="range"
                        min="1"
                        max="24"
                        step="0.5"
                        value={hoursPerDay}
                        onChange={(e) => setHoursPerDay(parseFloat(e.target.value) || 1)}
                        className="w-full accent-orange-500 bg-zinc-800 h-2 rounded-lg cursor-pointer"
                      />
                      <input
                        type="number"
                        min="1"
                        max="24"
                        step="0.5"
                        value={hoursPerDay}
                        onChange={(e) => setHoursPerDay(parseFloat(e.target.value) || 1)}
                        className="w-16 px-2.5 py-1.5 bg-zinc-950 border border-zinc-800 rounded-lg text-sm text-center font-mono text-zinc-100 focus:outline-none focus:border-orange-500"
                      />
                    </div>
                  </div>
                </div>

                <div className="pt-2 border-t border-zinc-800/80 text-xs text-zinc-400 flex flex-wrap items-center justify-between gap-2">
                  <span>
                    Total capacity: <strong className="text-zinc-200 font-mono">{workingHoursPerMonth.toLocaleString()} hrs/mo</strong> ·{' '}
                    <strong className="text-zinc-200 font-mono">{workingHoursPerYear.toLocaleString()} hrs/yr</strong>
                  </span>
                  <span className="text-zinc-500 text-[11px]">
                    Standard corporate baseline: 22 working days × 8 hours = 176 hrs/mo
                  </span>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Input Card with Dual Toggles (Version 1 - Kept Unchanged) */}
        <div className="bg-zinc-900/70 border border-zinc-800/90 rounded-2xl p-5 sm:p-7 relative shadow-xl space-y-6">
          
          {/* Toggles Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-zinc-800/60">
            {/* Currency toggle */}
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">
                Currency
              </span>
              <div className="inline-flex p-1 bg-zinc-950 rounded-xl border border-zinc-800">
                <button
                  type="button"
                  onClick={() => handleCurrencyChange('INR')}
                  className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                    currency === 'INR'
                      ? 'bg-orange-500 text-white shadow-sm'
                      : 'text-zinc-400 hover:text-zinc-200'
                  }`}
                >
                  ₹ INR (Rupees)
                </button>
                <button
                  type="button"
                  onClick={() => handleCurrencyChange('USD')}
                  className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                    currency === 'USD'
                      ? 'bg-orange-500 text-white shadow-sm'
                      : 'text-zinc-400 hover:text-zinc-200'
                  }`}
                >
                  $ USD (Dollars)
                </button>
              </div>
            </div>

            {/* Frequency Toggle */}
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">
                Frequency
              </span>
              <div className="inline-flex p-1 bg-zinc-950 rounded-xl border border-zinc-800">
                <button
                  type="button"
                  onClick={() => handlePeriodChange('annual')}
                  className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                    period === 'annual'
                      ? 'bg-orange-500 text-white shadow-sm'
                      : 'text-zinc-400 hover:text-zinc-200'
                  }`}
                >
                  Annual (Per Year)
                </button>
                <button
                  type="button"
                  onClick={() => handlePeriodChange('monthly')}
                  className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                    period === 'monthly'
                      ? 'bg-orange-500 text-white shadow-sm'
                      : 'text-zinc-400 hover:text-zinc-200'
                  }`}
                >
                  Monthly (Per Month)
                </button>
              </div>
            </div>
          </div>

          {/* Salary Input Box */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label 
                htmlFor={salaryInputId}
                className="text-sm font-semibold text-zinc-200 flex items-center gap-2"
              >
                <span>{period === 'annual' ? 'Annual Salary' : 'Monthly Salary'}</span>
                <span className="text-xs text-zinc-500 font-normal">
                  ({currency === 'INR' ? 'in ₹ INR' : 'in $ USD'})
                </span>
              </label>

              {/* Shorthand badge if available */}
              {isValidSalary && (
                <span className="text-xs font-mono font-medium text-orange-400 bg-orange-500/10 px-2 py-0.5 rounded-md border border-orange-500/20">
                  {currency === 'INR' ? getIndianShorthand(parsedSalary) : getUsdShorthand(parsedSalary)}
                </span>
              )}
            </div>

            {/* Input field with large styling */}
            <div className="relative flex items-center">
              <span className="absolute left-4 text-xl sm:text-2xl font-mono font-bold text-orange-500 select-none pointer-events-none">
                {currency === 'INR' ? '₹' : '$'}
              </span>
              
              <input
                id={salaryInputId}
                type="text"
                inputMode="numeric"
                value={salaryInput}
                onChange={(e) => setSalaryInput(e.target.value)}
                placeholder={currency === 'INR' ? (period === 'annual' ? 'e.g. 15,00,000' : 'e.g. 1,25,000') : (period === 'annual' ? 'e.g. 120,000' : 'e.g. 10,000')}
                className="w-full pl-11 sm:pl-12 pr-24 py-4 sm:py-5 bg-zinc-950 border border-zinc-800 focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 rounded-xl text-xl sm:text-3xl font-mono font-bold text-white placeholder-zinc-600 transition-all outline-none"
                autoComplete="off"
              />

              <div className="absolute right-3.5 flex items-center gap-1.5">
                {salaryInput && (
                  <button
                    type="button"
                    onClick={() => setSalaryInput('')}
                    className="p-1 rounded-md text-zinc-500 hover:text-zinc-200 hover:bg-zinc-800 transition-colors"
                    title="Clear"
                    aria-label="Clear input"
                  >
                    ✕
                  </button>
                )}
                <span className="text-xs font-medium text-zinc-500 bg-zinc-900 px-2 py-1 rounded-md border border-zinc-800 select-none">
                  /{period === 'annual' ? 'yr' : 'mo'}
                </span>
              </div>
            </div>

            {/* Presets Row */}
            <div className="flex items-center gap-1.5 flex-wrap pt-1">
              <span className="text-xs text-zinc-500 mr-1 flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-orange-500/80" /> Quick fill:
              </span>
              {presets.map((preset) => (
                <button
                  key={preset.value}
                  type="button"
                  onClick={() => setSalaryInput(preset.value)}
                  className={`text-xs px-2.5 py-1 rounded-lg border transition-all ${
                    cleanSalaryString === preset.value
                      ? 'bg-orange-500/20 border-orange-500/50 text-orange-300 font-semibold'
                      : 'bg-zinc-950/80 border-zinc-800 text-zinc-400 hover:text-zinc-200 hover:border-zinc-700'
                  }`}
                >
                  {preset.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* State Display: Empty vs Invalid vs Valid */}
        <AnimatePresence mode="wait">
          {/* 1. EMPTY STATE */}
          {isInputEmpty && (
            <motion.div
              key="empty-state"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.18 }}
              className="bg-zinc-900/50 border border-dashed border-zinc-800 rounded-2xl p-8 sm:p-12 text-center flex flex-col items-center justify-center space-y-3"
            >
              <div className="w-14 h-14 rounded-2xl bg-orange-500/10 border border-orange-500/20 flex items-center justify-center text-3xl shadow-[0_0_20px_rgba(249,115,22,0.15)]">
                🔥
              </div>
              <h2 className="text-lg sm:text-xl font-bold text-white">
                Enter your salary to ignite the calculator
              </h2>
              <p className="text-sm text-zinc-400 max-w-md">
                Type an annual or monthly figure above to reveal your live hourly and per-minute burn rate. No button clicking required.
              </p>
            </motion.div>
          )}

          {/* 2. ZERO OR NEGATIVE OR INVALID STATE */}
          {isInvalidOrZeroOrNegative && (
            <motion.div
              key="invalid-state"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              transition={{ duration: 0.18 }}
              className="bg-red-950/20 border border-red-900/40 rounded-2xl p-6 sm:p-10 text-center flex flex-col items-center justify-center space-y-3"
            >
              <div className="w-14 h-14 rounded-2xl bg-red-500/10 border border-red-500/30 flex items-center justify-center text-3xl">
                🙅‍♂️
              </div>
              <div className="space-y-1">
                <h2 className="text-xl sm:text-2xl font-black text-orange-400 tracking-tight">
                  Nah, that can&apos;t be the case
                </h2>
                <p className="text-sm text-zinc-400 max-w-md">
                  Unless you&apos;re voluntarily paying your employer to attend meetings, salary must be a positive number above zero.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setSalaryInput(currency === 'INR' ? '1500000' : '100000')}
                className="mt-2 text-xs font-semibold px-4 py-2 rounded-lg bg-orange-500 text-white hover:bg-orange-600 transition-colors shadow-sm"
              >
                Use sample {currency === 'INR' ? '₹15 LPA' : '$100k'}
              </button>
            </motion.div>
          )}

          {/* 3. COMPUTED BURN RATES (VALID STATE) */}
          {isValidSalary && (
            <motion.div
              key="valid-rates"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.2 }}
              className="space-y-6"
            >
              {/* Primary Rate Cards: Hourly & Per Minute (Version 1 - Kept Unchanged) */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                
                {/* Hourly Rate Card */}
                <div className="bg-zinc-900/90 border border-orange-500/30 rounded-2xl p-6 sm:p-8 flex flex-col justify-between relative overflow-hidden group hover:border-orange-500/50 transition-all fire-box-glow">
                  {/* Subtle corner flame watermark */}
                  <div className="absolute -right-4 -bottom-4 text-7xl opacity-5 select-none pointer-events-none group-hover:scale-110 transition-transform">
                    🔥
                  </div>

                  <div className="space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-orange-400 uppercase tracking-widest flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5" /> Hourly Burn Rate
                      </span>
                      <span className="text-lg">🔥</span>
                    </div>
                    <p className="text-xs text-zinc-400">
                      Cost per single hour of work
                    </p>
                  </div>

                  <div className="my-5 sm:my-7">
                    <div className="flex items-baseline gap-2 flex-wrap">
                      <span className="text-3xl sm:text-5xl font-black font-mono text-white tracking-tight fire-glow">
                        {formatCurrency(hourlyRate)}
                      </span>
                      <span className="text-base sm:text-xl font-bold text-orange-400 font-mono">
                        / hr
                      </span>
                      <span className="text-2xl sm:text-3xl animate-bounce" title="On fire">
                        🔥
                      </span>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-zinc-800 text-xs text-zinc-400 flex items-center justify-between">
                    <span>
                      {safeHours} hrs/day · {safeDays} days/mo
                    </span>
                    <span className="font-mono text-zinc-300">
                      ~{(workingHoursPerYear).toLocaleString()} hrs / yr
                    </span>
                  </div>
                </div>

                {/* Per Minute Rate Card */}
                <div className="bg-zinc-900/90 border border-orange-500/30 rounded-2xl p-6 sm:p-8 flex flex-col justify-between relative overflow-hidden group hover:border-orange-500/50 transition-all fire-box-glow">
                  {/* Subtle corner flame watermark */}
                  <div className="absolute -right-4 -bottom-4 text-7xl opacity-5 select-none pointer-events-none group-hover:scale-110 transition-transform">
                    🔥
                  </div>

                  <div className="space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-orange-400 uppercase tracking-widest flex items-center gap-1.5">
                        <Zap className="w-3.5 h-3.5" /> Per Minute Burn Rate
                      </span>
                      <span className="text-lg">🔥</span>
                    </div>
                    <p className="text-xs text-zinc-400">
                      Every ticking sixty seconds of a meeting
                    </p>
                  </div>

                  <div className="my-5 sm:my-7">
                    <div className="flex items-baseline gap-2 flex-wrap">
                      <span className="text-3xl sm:text-5xl font-black font-mono text-white tracking-tight fire-glow">
                        {formatCurrency(minuteRate)}
                      </span>
                      <span className="text-base sm:text-xl font-bold text-orange-400 font-mono">
                        / min
                      </span>
                      <span className="text-2xl sm:text-3xl animate-pulse" title="Per minute flame">
                        🔥
                      </span>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-zinc-800 text-xs text-zinc-400 flex items-center justify-between">
                    <span>
                      Per second:{' '}
                      <strong className="text-zinc-200 font-mono">
                        {formatCurrency(secondRate, 3, 3)}/s
                      </strong>
                    </span>
                    <span className="text-orange-400/90 font-medium">
                      {(minuteRate * 15 > 0) ? `15m = ${formatCurrency(minuteRate * 15, 0, 0)}` : ''}
                    </span>
                  </div>
                </div>
              </div>

              {/* ============================================================== */}
              {/* VERSION 2 FEATURE: MEETING COST CALCULATOR BELOW RATE DISPLAY */}
              {/* ============================================================== */}
              <div className="bg-zinc-900/90 border-2 border-orange-500/40 rounded-2xl p-6 sm:p-8 shadow-2xl relative overflow-hidden space-y-7 fire-box-glow">
                
                {/* Section Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-zinc-800">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded-md bg-orange-500/20 text-orange-400 border border-orange-500/30 text-xs font-bold uppercase tracking-wider flex items-center gap-1">
                        <Flame className="w-3.5 h-3.5 fill-current" /> Meeting Cost Burner
                      </span>
                    </div>
                    <h2 className="text-lg sm:text-xl font-bold text-white tracking-tight">
                      Calculate Your Meeting&apos;s Financial Burn
                    </h2>
                  </div>
                  <span className="text-xs text-zinc-400 bg-zinc-950 px-3 py-1.5 rounded-lg border border-zinc-800/80 self-start sm:self-auto">
                    Assuming all attendees share this salary rate
                  </span>
                </div>

                {/* Meeting Inputs Grid: Duration Slider & Attendees Stepper */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  
                  {/* Input 1: Meeting Duration (Slider from 15 to 480 mins) */}
                  <div className="space-y-3 bg-zinc-950/70 border border-zinc-800/80 p-4 sm:p-5 rounded-xl">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-semibold text-zinc-300 uppercase tracking-wider flex items-center gap-1.5">
                        <Timer className="w-3.5 h-3.5 text-orange-400" />
                        Meeting Duration
                      </label>
                      <span className="text-sm font-mono font-bold text-orange-400 bg-orange-500/10 px-2.5 py-0.5 rounded-md border border-orange-500/20">
                        {formatDuration(meetingDuration)} ({meetingDuration} min)
                      </span>
                    </div>

                    <div className="space-y-2">
                      <input
                        type="range"
                        min="15"
                        max="480"
                        step="5"
                        value={meetingDuration}
                        onChange={(e) => setMeetingDuration(parseInt(e.target.value) || 15)}
                        className="w-full accent-orange-500 bg-zinc-800 h-2.5 rounded-lg cursor-pointer"
                      />
                      <div className="flex justify-between text-[11px] text-zinc-500 font-mono">
                        <span>15 mins</span>
                        <span>1 hr</span>
                        <span>2 hrs</span>
                        <span>4 hrs</span>
                        <span>8 hrs (480m)</span>
                      </div>
                    </div>

                    {/* Quick duration presets */}
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {[15, 30, 45, 60, 90, 120, 240, 480].map((mins) => (
                        <button
                          key={mins}
                          type="button"
                          onClick={() => setMeetingDuration(mins)}
                          className={`text-xs px-2.5 py-1 rounded-lg border transition-all ${
                            meetingDuration === mins
                              ? 'bg-orange-500 text-white border-orange-400 font-semibold shadow-sm'
                              : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-zinc-200 hover:border-zinc-700'
                          }`}
                        >
                          {mins < 60 ? `${mins}m` : mins === 60 ? '1h' : `${mins / 60}h`}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Input 2: Number of Attendees (Stepper from 1 to 25, default 5) */}
                  <div className="space-y-3 bg-zinc-950/70 border border-zinc-800/80 p-4 sm:p-5 rounded-xl flex flex-col justify-between">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-semibold text-zinc-300 uppercase tracking-wider flex items-center gap-1.5">
                        <Users className="w-3.5 h-3.5 text-orange-400" />
                        Number of Attendees
                      </label>
                      <span className="text-xs text-zinc-500 font-mono">
                        Range: 1 to 25
                      </span>
                    </div>

                    {/* Stepper control */}
                    <div className="flex items-center gap-3">
                      <button
                        type="button"
                        onClick={() => handleAttendeeChange(-1)}
                        disabled={attendees <= 1}
                        className="w-12 h-12 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-200 hover:bg-zinc-800 hover:border-zinc-700 active:scale-95 disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center transition-all"
                        aria-label="Decrease attendees"
                      >
                        <Minus className="w-5 h-5" />
                      </button>

                      <div className="flex-1 bg-zinc-900 border border-zinc-800 rounded-xl h-12 flex items-center justify-center gap-2">
                        <span className="text-2xl font-mono font-bold text-white">
                          {attendees}
                        </span>
                        <span className="text-xs font-medium text-zinc-400">
                          {attendees === 1 ? 'person' : 'attendees'}
                        </span>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleAttendeeChange(1)}
                        disabled={attendees >= 25}
                        className="w-12 h-12 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-200 hover:bg-zinc-800 hover:border-zinc-700 active:scale-95 disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center transition-all"
                        aria-label="Increase attendees"
                      >
                        <Plus className="w-5 h-5" />
                      </button>
                    </div>

                    {/* Quick attendee presets */}
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {[
                        { count: 2, label: '2 (1:1)' },
                        { count: 5, label: '5 (Scrum)' },
                        { count: 10, label: '10 (Team)' },
                        { count: 15, label: '15 (Dept)' },
                        { count: 25, label: '25 (Max)' },
                      ].map(({ count, label }) => (
                        <button
                          key={count}
                          type="button"
                          onClick={() => setAttendees(count)}
                          className={`text-xs px-2.5 py-1 rounded-lg border transition-all ${
                            attendees === count
                              ? 'bg-orange-500 text-white border-orange-400 font-semibold shadow-sm'
                              : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-zinc-200 hover:border-zinc-700'
                          }`}
                        >
                          {label}
                        </button>
                      ))}
                    </div>
                  </div>

                </div>

                {/* Live Meeting Burn Hero Box */}
                <div className="bg-zinc-950 border border-orange-500/30 rounded-2xl p-6 sm:p-8 space-y-4">
                  <div className="flex flex-col gap-1">
                    <span className="text-xs sm:text-sm font-semibold uppercase tracking-wider text-orange-400 flex items-center gap-1.5">
                      <Flame className="w-4 h-4 fill-orange-500 text-orange-500" />
                      Total Meeting Cost
                    </span>

                    {/* Huge Text: "The meeting burns Rs X" */}
                    <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1 mt-1">
                      <span className="text-xl sm:text-3xl font-extrabold text-zinc-300">
                        The meeting burns
                      </span>
                      <div className="flex items-baseline gap-2">
                        <span className="text-4xl sm:text-6xl md:text-7xl font-black font-mono text-orange-400 tracking-tight fire-glow">
                          {currency === 'INR' ? 'Rs ' : '$ '}
                          {Math.round(totalMeetingBurn).toLocaleString(currency === 'INR' ? 'en-IN' : 'en-US')}
                        </span>
                        <span className="text-3xl sm:text-5xl animate-bounce select-none">
                          🔥
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Formula Breakdown pill */}
                  <div className="text-xs text-zinc-400 flex flex-wrap items-center gap-2 pt-1 border-t border-zinc-800/80">
                    <span className="font-mono text-zinc-300 font-semibold">
                      {attendees} attendees × {meetingDuration} mins × {formatCurrency(minuteRate, 2, 2)}/min
                    </span>
                    <span className="text-zinc-600">•</span>
                    <span className="text-zinc-400">
                      Cost per minute for the full room: <strong className="text-zinc-200 font-mono">{formatCurrency(minuteRate * attendees, 2, 2)}/min</strong>
                    </span>
                  </div>

                  {/* Comparison Line for Human Comprehension */}
                  <div className="mt-4 p-4 sm:p-5 rounded-xl bg-gradient-to-r from-orange-500/15 via-orange-500/5 to-transparent border border-orange-500/30 flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl sm:text-3xl select-none shrink-0">💡</span>
                      <div className="space-y-0.5">
                        <div className="text-[11px] uppercase tracking-wider font-bold text-orange-400/90">
                          Reality Check
                        </div>
                        <div className="text-base sm:text-xl font-extrabold text-white tracking-tight flex items-center gap-2">
                          <span>&ldquo;{activeComparison}&rdquo;</span>
                        </div>
                      </div>
                    </div>

                    {comparisons.length > 1 && (
                      <button
                        type="button"
                        onClick={() => setComparisonVariantIndex((prev) => (prev + 1) % comparisons.length)}
                        className="text-xs text-orange-400 hover:text-orange-300 px-3 py-1.5 rounded-lg bg-orange-500/10 hover:bg-orange-500/20 border border-orange-500/25 transition-colors flex items-center gap-1.5 shrink-0"
                        title="View another equivalent comparison"
                      >
                        <RefreshCw className="w-3.5 h-3.5" />
                        <span className="hidden sm:inline">Alternate</span>
                      </button>
                    )}
                  </div>
                </div>

              </div>

              {/* Real-world Meeting Durations Burn Preview (Version 1 - Kept Unchanged) */}
              <div className="bg-zinc-900/60 border border-zinc-800 rounded-2xl p-5 space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-zinc-300 uppercase tracking-wider flex items-center gap-1.5">
                    <TrendingUp className="w-3.5 h-3.5 text-orange-400" />
                    Quick Reference Durations (1 Person)
                  </span>
                  <span className="text-xs text-zinc-500">
                    Single person burn
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div className="bg-zinc-950/70 p-3.5 rounded-xl border border-zinc-800/80 flex flex-col">
                    <span className="text-[11px] text-zinc-400 font-medium">15-min Standup</span>
                    <span className="text-lg sm:text-xl font-bold font-mono text-zinc-100 mt-1">
                      {formatCurrency(minuteRate * 15, 0, 0)}
                    </span>
                    <span className="text-[10px] text-orange-400/80 mt-0.5">🔥 quick sync</span>
                  </div>

                  <div className="bg-zinc-950/70 p-3.5 rounded-xl border border-zinc-800/80 flex flex-col">
                    <span className="text-[11px] text-zinc-400 font-medium">30-min 1-on-1</span>
                    <span className="text-lg sm:text-xl font-bold font-mono text-zinc-100 mt-1">
                      {formatCurrency(minuteRate * 30, 0, 0)}
                    </span>
                    <span className="text-[10px] text-orange-400/80 mt-0.5">🔥 standard sync</span>
                  </div>

                  <div className="bg-zinc-950/70 p-3.5 rounded-xl border border-zinc-800/80 flex flex-col">
                    <span className="text-[11px] text-zinc-400 font-medium">45-min Review</span>
                    <span className="text-lg sm:text-xl font-bold font-mono text-zinc-100 mt-1">
                      {formatCurrency(minuteRate * 45, 0, 0)}
                    </span>
                    <span className="text-[10px] text-orange-400/80 mt-0.5">🔥 sprint review</span>
                  </div>

                  <div className="bg-zinc-950/70 p-3.5 rounded-xl border border-zinc-800/80 flex flex-col">
                    <span className="text-[11px] text-zinc-400 font-medium">60-min All Hands</span>
                    <span className="text-lg sm:text-xl font-bold font-mono text-zinc-100 mt-1">
                      {formatCurrency(hourlyRate, 0, 0)}
                    </span>
                    <span className="text-[10px] text-orange-400/80 mt-0.5">🔥 full hour</span>
                  </div>
                </div>
              </div>

              {/* Live Burn Stopwatch Mode (Version 1 - Kept Unchanged) */}
              <div className="bg-gradient-to-r from-orange-950/20 via-zinc-900 to-zinc-900 border border-orange-500/20 rounded-2xl p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-orange-400 uppercase tracking-wider">
                      Live Meeting Burner
                    </span>
                    {isLiveTickerActive && (
                      <span className="inline-flex items-center gap-1 text-[11px] font-mono text-orange-400 bg-orange-500/10 px-2 py-0.5 rounded-full border border-orange-500/30">
                        <span className="w-1.5 h-1.5 rounded-full bg-orange-500 animate-ping" />
                        Burning live
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-zinc-400">
                    Start a live clock right now to watch your money burn second by second.
                  </p>
                </div>

                <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end">
                  <div className="text-right">
                    <div className="text-xs text-zinc-500 font-mono">
                      {Math.floor(liveSecondsElapsed / 60)}m {liveSecondsElapsed % 60}s elapsed
                    </div>
                    <div className="text-xl sm:text-2xl font-mono font-bold text-orange-400">
                      {formatCurrency(liveBurnedAmount, 2, 2)} 🔥
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => setIsLiveTickerActive(!isLiveTickerActive)}
                    className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all shadow-sm ${
                      isLiveTickerActive
                        ? 'bg-zinc-800 text-zinc-200 hover:bg-zinc-700 border border-zinc-700'
                        : 'bg-orange-500 hover:bg-orange-600 text-white'
                    }`}
                  >
                    {isLiveTickerActive ? (
                      <>
                        <Square className="w-3.5 h-3.5 fill-current" /> Stop
                      </>
                    ) : (
                      <>
                        <Play className="w-3.5 h-3.5 fill-current" /> Start Live Ticker
                      </>
                    )}
                  </button>
                </div>
              </div>

            </motion.div>
          )}
        </AnimatePresence>

        {/* Calculation Formula Transparency Card */}
        <div className="mt-4 p-4 rounded-xl bg-zinc-950/60 border border-zinc-900 text-xs text-zinc-500 space-y-1">
          <div className="flex items-center gap-1.5 font-medium text-zinc-400">
            <HelpCircle className="w-3.5 h-3.5 text-zinc-400" />
            <span>How rates and meeting burns are computed</span>
          </div>
          <p>
            {period === 'annual'
              ? `Annual Salary ÷ (${safeDays} working days × 12 months × ${safeHours} hours/day = ${workingHoursPerYear.toLocaleString()} hours/year).`
              : `Monthly Salary ÷ (${safeDays} working days × ${safeHours} hours/day = ${workingHoursPerMonth.toLocaleString()} hours/month).`}{' '}
            Per minute rate is derived by dividing hourly rate by 60 minutes. Meeting cost = (Per minute rate) × (Meeting duration in minutes) × (Number of attendees).
          </p>
        </div>

      </main>

      {/* Clean Footer */}
      <footer className="w-full border-t border-zinc-900 py-6 text-center text-xs text-zinc-600">
        <div className="max-w-4xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>Meeting Cost · Salary & Meeting Burn Rate Calculator</span>
          <span>Because every minute in a meeting costs real money 🔥</span>
        </div>
      </footer>
    </div>
  );
}
