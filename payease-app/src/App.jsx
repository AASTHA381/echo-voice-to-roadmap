import React, { useState, useEffect, useRef } from 'react';
import { 
  ArrowLeft, Wallet, Send, FileText, CheckCircle2, ChevronRight,
  TrendingUp, BarChart3, Settings, ShieldCheck, QrCode, Sparkles,
  Users, Check, Info, Award, Smartphone, Database, Compass, Plus,
  DollarSign, Download, Sliders, Play, Share2, HelpCircle
} from 'lucide-react';

// Pre-seeded contacts for simulated P2P payment flow
const INITIAL_CONTACTS = [
  { id: 1, name: 'Rohit Sharma', phone: '+91 98765 43210', initial: 'RS', color: '#6366f1' },
  { id: 2, name: 'Priya Patel', phone: '+91 91234 56789', initial: 'PP', color: '#10b981' },
  { id: 3, name: 'Aarav Mehta', phone: '+91 88776 55443', initial: 'AM', color: '#ec4899' },
  { id: 4, name: 'Sneha Rao', phone: '+91 95554 32110', initial: 'SR', color: '#f59e0b' }
];

const INITIAL_BILLERS = [
  { id: 'elec', name: 'BSES Rajdhani Power', desc: 'Due Date: 25 Aug 2026', amount: 2150, actionText: 'Pay', icon: 'settings', color: 'rgba(245,158,11,0.1)', textColor: 'var(--warning)' },
  { id: 'jio', name: 'Jio Prepaid (+91 999...)', desc: 'Plan Expired', amount: 749, actionText: 'Renew', icon: 'phone', color: 'rgba(99,102,241,0.1)', textColor: 'var(--primary)' }
];

// Pre-seeded transaction history
const INITIAL_TRANSACTIONS = [
  { id: 101, title: 'Electricity Bill Paid', amount: 2150, type: 'debit', date: 'Today, 11:30 AM', category: 'Bills' },
  { id: 102, title: 'Received from Rohit Sharma', amount: 1500, type: 'credit', date: 'Yesterday, 4:15 PM', category: 'P2P' },
  { id: 103, title: 'Fresh & Easy Supermarket', amount: 620, type: 'debit', date: '15 Aug 2026', category: 'Food' },
  { id: 104, title: 'Café Coffee Day', amount: 280, type: 'debit', date: '14 Aug 2026', category: 'Food' }
];

// Pre-seeded RICE backlog features
const INITIAL_BACKLOG = [
  { id: 1, name: 'AI Spending Insights & Alerts', category: 'AI & Data', reach: 500000, impact: 3, confidence: 0.9, effort: 3, moscow: 'Must' },
  { id: 2, name: 'One-Tap Bill Split with QR Scan', category: 'P2P Payments', reach: 800000, impact: 2.5, confidence: 0.85, effort: 2, moscow: 'Should' },
  { id: 3, name: 'Instant Merchant Settlement', category: 'Merchant', reach: 200000, impact: 3, confidence: 0.9, effort: 4, moscow: 'Must' },
  { id: 4, name: 'Offline UPI Balance/Payments', category: 'Infrastructure', reach: 1200000, impact: 2, confidence: 0.7, effort: 5, moscow: 'Could' },
  { id: 5, name: 'Multilingual Voice Guidance', category: 'Growth', reach: 1000000, impact: 2.5, confidence: 0.8, effort: 3, moscow: 'Should' }
];

export default function App() {
  // Mobile app simulator state
  const [simulatorMode, setSimulatorMode] = useState('user'); // user | merchant
  const [activeScreen, setActiveScreen] = useState('wallet'); // wallet | p2p | bills | insights | merchant-dash | qr-gen
  const [walletBalance, setWalletBalance] = useState(12500);
  const [merchantBalance, setMerchantBalance] = useState(48200);
  const [transactions, setTransactions] = useState(INITIAL_TRANSACTIONS);
  const [contacts, setContacts] = useState(INITIAL_CONTACTS);
  
  // P2P Payment flow states
  const [selectedContact, setSelectedContact] = useState(null);
  const [transferAmount, setTransferAmount] = useState('');
  const [transferNote, setTransferNote] = useState('');
  const [upiPin, setUpiPin] = useState('');
  const [p2pStep, setP2pStep] = useState(1); // 1: Select contact, 2: Keypad, 3: UPI PIN, 4: Processing, 5: Success
  const [scratched, setScratched] = useState(false);
  const [cashbackWon, setCashbackWon] = useState(0);
  
  // Bill payment states
  const [selectedBillType, setSelectedBillType] = useState(''); // electricity | mobile
  const [billAmount, setBillAmount] = useState(0);
  const [billers, setBillers] = useState(INITIAL_BILLERS);
  
  // Interactive SIP states
  const [sipStep, setSipStep] = useState(0); // 0: None, 1: Risk selection, 2: Duration selection
  const [selectedRisk, setSelectedRisk] = useState('');
  const [selectedDuration, setSelectedDuration] = useState('');
  
  // AI Insights Chat Bot states
  const [chatLog, setChatLog] = useState([
    { sender: 'bot', text: 'Hi! I am your PayEase AI Copilot. I analyze your spending to save you money. Click a prompt below to see what I can do!' }
  ]);
  const [isTyping, setIsTyping] = useState(false);
  const [customPrompt, setCustomPrompt] = useState('');
  const chatBoxRef = useRef(null);
  const lastRecommendationRef = useRef(null);

  // Auto-scroll chat box when new messages arrive
  useEffect(() => {
    if (chatBoxRef.current) {
      chatBoxRef.current.scrollTop = chatBoxRef.current.scrollHeight;
    }
  }, [chatLog, isTyping]);

  // Merchant QR code state
  const [qrAmount, setQrAmount] = useState('');
  const [generatedQr, setGeneratedQr] = useState(false);
  const [merchantTransactions, setMerchantTransactions] = useState([
    { id: 201, title: 'Received from Sneha Rao', amount: 450, type: 'credit', date: 'Just now' },
    { id: 202, title: 'Received from Priya Patel', amount: 1200, type: 'credit', date: '10 mins ago' }
  ]);

  // PM Portfolio center state
  const [portfolioTab, setPortfolioTab] = useState('prd'); // prd | backlog | metrics | roadmap
  const [prdSection, setPrdSection] = useState('exec'); // exec | personas | features | tech | gtm
  const [backlogList, setBacklogList] = useState(INITIAL_BACKLOG);
  
  // Unit Economics Model states
  const [sliderCac, setSliderCac] = useState(8); // $8
  const [sliderArpu, setSliderArpu] = useState(25); // $25
  const [sliderRetention, setSliderRetention] = useState(50); // 50%

  // Simulated live clock for status bar
  const [currentTime, setCurrentTime] = useState('09:41');
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      let hours = now.getHours();
      let minutes = now.getMinutes();
      const strHours = hours < 10 ? `0${hours}` : hours;
      const strMinutes = minutes < 10 ? `0${minutes}` : minutes;
      setCurrentTime(`${strHours}:${strMinutes}`);
    };
    updateTime();
    const interval = setInterval(updateTime, 60000);
    return () => clearInterval(interval);
  }, []);

  // AI Chat Bot Auto-Replies mapping
  const botReplies = {
    'How can I save ₹2,000 this month?': 
      'Looking at your transactions, your Food & Supermarket spend is currently ₹4,820, which is 25% higher than your average. By dining out just twice less this month and choosing domestic brands, you can save approximately ₹1,800. Additionally, setting a utility threshold alert will help prevent DTH overages, shaving off another ₹350!',
    'Why is my food spend so high?': 
      'You had 5 transactions at "Fresh & Easy Supermarket" and "Café Coffee Day" in the last week, totaling ₹900. Food and leisure purchases now account for 38% of your overall monthly spending. I recommend creating a custom "Dining Cap" notification in your PayEase Settings at ₹3,000.',
    'Will I meet my savings goal?': 
      'Great news! Based on your current wallet balance of ₹12,500 and stable utility bill cycles, you are on track to exceed your monthly savings goal of ₹10,000 by 12.5%. I suggest moving ₹2,000 into our high-yield self-investment pocket (future feature spec) to earn 7.2% APR.'
  };

  const handlePromptClick = (promptText) => {
    if (isTyping) return;
    
    // Add user message
    const newLog = [...chatLog, { sender: 'user', text: promptText }];
    setChatLog(newLog);
    setIsTyping(true);
    
    // Simulated chatbot reply
    setTimeout(() => {
      const reply = botReplies[promptText] || 'I can help analyze your transactions, track budgets, and optimize bill schedules. Try selecting one of our quick prompts!';
      setChatLog(prev => [...prev, { sender: 'bot', text: reply }]);
      setIsTyping(false);
    }, 1000);
  };

  const renderFormattedText = (text) => {
    if (!text) return '';
    const parts = text.split('**');
    return parts.map((part, index) => {
      if (index % 2 === 1) {
        return <strong key={index}>{part}</strong>;
      }
      return part;
    });
  };

  const addBillerFromRecommendation = (biller) => {
    if (billers.some(b => b.name === biller.name)) {
      alert(`${biller.name} is already added to your Utilities list!`);
      return;
    }
    setBillers(prev => [...prev, {
      id: Date.now().toString(),
      name: biller.name,
      desc: biller.desc,
      amount: biller.amount,
      actionText: biller.actionText || 'Pay',
      icon: biller.icon || 'file',
      color: biller.color || 'rgba(6,182,212,0.1)',
      textColor: biller.textColor || 'var(--secondary)'
    }]);
    
    setChatLog(prev => [...prev, {
      sender: 'bot',
      text: `✅ Added "${biller.name}" (₹${biller.amount}) to your Utilities checklist! You can now view and pay it under the Payments tab.`
    }]);
  };

  const handleSipRiskSelect = (risk) => {
    setSelectedRisk(risk);
    setChatLog(prev => [...prev, { sender: 'user', text: `My risk appetite: ${risk}` }]);
    setIsTyping(true);
    
    setTimeout(() => {
      setChatLog(prev => [...prev, {
        sender: 'bot',
        text: `Understood. Risk profile set to: ${risk.split(' (')[0]}.\n\nNext, what is your intended **Investment Timeframe**?`
      }]);
      setSipStep(2);
      setIsTyping(false);
    }, 1000);
  };

  const handleSipDurationSelect = (label, months) => {
    setSelectedDuration(label);
    setChatLog(prev => [...prev, { sender: 'user', text: `Investment duration: ${label}` }]);
    setIsTyping(true);

    setTimeout(() => {
      let interestRate = 0.12; 
      let rateLabel = "12%";
      if (selectedRisk.includes('Low')) {
        interestRate = 0.07;
        rateLabel = "7%";
      }
      if (selectedRisk.includes('High')) {
        interestRate = 0.18;
        rateLabel = "18%";
      }

      const targetGoal = 100000;
      const r = interestRate / 12;
      const n = months;
      const denominator = ((Math.pow(1 + r, n) - 1) / r) * (1 + r);
      const exactSip = Math.round(targetGoal / denominator);
      const surplusPercent = Math.round((exactSip / 8000) * 100);

      const replyText = `📊 **Suggested SIP Projection:**
• **Target Goal:** ₹1,00,000 (Indicative Future Value)
• **Timeframe:** ${label} (${months} months)
• **Portfolio Profile:** ${selectedRisk.split(' (')[0]} (Hypothetical rate: ${rateLabel} p.a.)
• **Suggested Monthly Contribution:** **₹${exactSip.toLocaleString('en-IN')}**

**Liquidity Buffer Evaluation:**
This allocation represents roughly **${surplusPercent}%** of your estimated monthly surplus (₹8,000), retaining ₹${(8000 - exactSip).toLocaleString('en-IN')} as an active cash buffer.

Would you like to add this proposed Mutual Fund SIP to your Utilities checklist to track your goals?

⚠️ *Disclaimer: Mutual Fund investments are subject to market risks. Read all scheme related documents carefully. This is an illustrative projection, not formal financial advice or guaranteed return claiming.*`;

      const recData = {
        name: `Mutual Fund SIP (${selectedRisk.split(' (')[0].split(' ')[1] || 'Balanced'})`,
        desc: `Monthly Mutual Fund SIP - ${label}`,
        amount: exactSip,
        icon: 'trend',
        color: 'rgba(16,185,129,0.1)',
        textColor: 'var(--success)',
        actionText: 'Pay'
      };

      lastRecommendationRef.current = { type: 'single', data: recData };

      setChatLog(prev => [...prev, {
        sender: 'bot',
        text: replyText,
        recommendation: recData
      }]);
      setSipStep(0); 
      setIsTyping(false);
    }, 1500);
  };

  const callRealApiChat = async (userText) => {
    try {
      const history = chatLog.slice(-5).map(msg => ({
        role: msg.sender === 'user' ? 'user' : 'assistant',
        content: msg.text
      }));

      const res = await fetch('http://localhost:8000/api/copilot/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          message: userText,
          history: history
        })
      });

      if (!res.ok) {
        throw new Error('API server error');
      }

      const data = await res.json();
      return data.response;
    } catch (err) {
      console.warn('Real AI Chat API failed, using local simulation fallback:', err);
      return null;
    }
  };

  const handleCustomSubmit = (e) => {
    e.preventDefault();
    if (!customPrompt.trim() || isTyping) return;

    const userText = customPrompt.trim();
    setCustomPrompt('');
    
    // Add user message
    setChatLog(prev => [...prev, { sender: 'user', text: userText }]);
    setIsTyping(true);

    // Simulated chatbot reply
    setTimeout(async () => {
      let reply = '';
      const lowercaseText = userText.toLowerCase();

      // Check if user is confirming a recommendation (e.g. answering "yes" or "ok" to adding payees)
      const isConfirmation = 
        lowercaseText === 'yes' || 
        lowercaseText === 'ok' || 
        lowercaseText === 'y' || 
        lowercaseText === 'add' ||
        lowercaseText.includes('yes') || 
        lowercaseText.includes('ok') || 
        lowercaseText.includes('sure') || 
        lowercaseText.includes('add it') || 
        lowercaseText.includes('add this') ||
        lowercaseText.includes('do it') ||
        lowercaseText.includes('confirm');

      if (isConfirmation) {
        if (lastRecommendationRef.current) {
          const rec = lastRecommendationRef.current;
          lastRecommendationRef.current = null; // Clear ref
          
          if (rec.type === 'single') {
            addBillerFromRecommendation(rec.data);
          } else if (rec.type === 'list') {
            rec.data.forEach(item => {
              addBillerFromRecommendation(item);
            });
          }
          setIsTyping(false);
          return;
        } else {
          reply = "Understood! Let me know if you would like me to analyze your bills or plan a suggested SIP timeframe.";
          setChatLog(prev => [...prev, { sender: 'bot', text: reply }]);
          setIsTyping(false);
          return;
        }
      }
      
      if (lowercaseText.includes('sip') || lowercaseText.includes('invest')) {
        setChatLog(prev => [...prev, {
          sender: 'bot',
          text: "I can help you review a suggested SIP allocation. Based on your current wallet balance of **₹12,500** and monthly surplus of **₹8,000**:\n\nPlease select your preferred **Risk Profile** below to start the estimation:"
        }]);
        setSipStep(1);
        setIsTyping(false);
        return;
      }

      if (lowercaseText.includes('bill') || lowercaseText.includes('utility') || lowercaseText.includes('pay')) {
        const billsList = [
          { name: 'Delhi Jal Board (Water)', desc: 'Due Date: 28 Aug 2026', amount: 1120, icon: 'water', color: 'rgba(6,182,212,0.1)', textColor: 'var(--secondary)' },
          { name: 'Indraprastha Gas (LPG)', desc: 'Due Date: 30 Aug 2026', amount: 820, icon: 'flame', color: 'rgba(244,63,94,0.1)', textColor: 'var(--danger)' }
        ];

        lastRecommendationRef.current = { type: 'list', data: billsList };

        setChatLog(prev => [...prev, {
          sender: 'bot',
          text: "Here are my recommendations based on your recurring payment patterns. You have two outstanding bills that are not in your checklist:\n\n1. **Delhi Jal Board (Water)**: ₹1,120\n2. **Indraprastha Gas (LPG)**: ₹820\n\nYou can click the buttons below to add them to your utilities checklist.",
          recommendationsList: billsList
        }]);
        setIsTyping(false);
        return;
      }

      // Try hitting the live LLM endpoint first
      const realApiResponse = await callRealApiChat(userText);
      if (realApiResponse) {
        setChatLog(prev => [...prev, { sender: 'bot', text: realApiResponse }]);
        setIsTyping(false);
        return;
      }

      // Match predefined keys or generate smart contextual answer
      if (lowercaseText.includes('save') || lowercaseText.includes('budget')) {
        reply = "I've analyzed your monthly recurring expenses. Setting a utility limit of ₹3,000 and utilizing BSES auto-pay options will secure an estimated ₹400 in savings, while reducing dining frequency by 15% will add ₹1,200 to your wallet this month.";
      } else if (lowercaseText.includes('food') || lowercaseText.includes('dining') || lowercaseText.includes('spend')) {
        reply = "Your dining and food category totals ₹4,820 this month. This accounts for 38% of your overall monthly expenses. I recommend creating a custom 'Dining Cap' alert inside settings to keep this under ₹3,000.";
      } else if (lowercaseText.includes('goal') || lowercaseText.includes('savings')) {
        reply = "With ₹12,500 currently in your wallet, you have already met 85% of your standard target. If you restrict discretionary shopping for the next 7 days, you will exceed your savings target by ₹1,500!";
      } else if (lowercaseText.includes('hello') || lowercaseText.includes('hi') || lowercaseText.includes('hey')) {
        reply = "Hello! I am your PayEase AI Finance Copilot. You can ask me how to optimize your utility bills, budget limits, or analyze recent transactions. Go ahead!";
      } else {
        reply = "I didn't quite catch that. I am your PayEase AI Finance Copilot. You can ask me to help you analyze your budget, check your outstanding bills, or estimate a suggested SIP.";
      }

      setChatLog(prev => [...prev, { sender: 'bot', text: reply }]);
      setIsTyping(false);
    }, 1200);
  };

  // Backlog prioritization helper
  const handleRiceChange = (id, field, value) => {
    const updated = backlogList.map(item => {
      if (item.id === id) {
        const numericVal = parseFloat(value) || 0;
        return { ...item, [field]: numericVal };
      }
      return item;
    });
    setBacklogList(updated);
  };

  const getRiceScore = (item) => {
    if (item.effort === 0) return 0;
    return Math.round((item.reach * item.impact * item.confidence) / item.effort);
  };

  const sortedBacklog = [...backlogList].sort((a, b) => getRiceScore(b) - getRiceScore(a));

  const exportBacklogToCsv = () => {
    const headers = ['Rank', 'Feature Name', 'Category', 'Reach', 'Impact', 'Confidence', 'Effort', 'RICE Score', 'MoSCoW'];
    const rows = sortedBacklog.map((item, index) => [
      index + 1,
      `"${item.name}"`,
      item.category,
      item.reach,
      item.impact,
      item.confidence,
      item.effort,
      getRiceScore(item),
      item.moscow
    ]);
    
    const csvContent = [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', 'payease_rice_backlog.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Financial model formulas
  const calculateLtv = () => {
    const churnRate = 1 - (sliderRetention / 100);
    if (churnRate === 0) return 0;
    return Math.round(sliderArpu / churnRate);
  };

  const ltvVal = calculateLtv();
  const ltvCacRatio = (ltvVal / sliderCac).toFixed(1);

  const getRatioBadgeStyle = () => {
    const ratio = parseFloat(ltvCacRatio);
    if (ratio < 3.0) return { label: 'Poor Economics', class: 'moscow-must' };
    if (ratio >= 3.0 && ratio < 6.0) return { label: 'Healthy (Target)', class: 'moscow-could' };
    return { label: 'Excellent Potential', class: 'moscow-should' };
  };

  // Simulator P2P payments logic
  const handleKeypadPress = (val) => {
    if (val === 'C') {
      setTransferAmount('');
    } else if (val === '⌫') {
      setTransferAmount(prev => prev.slice(0, -1));
    } else {
      if (transferAmount.length >= 6) return; // Limit input length
      setTransferAmount(prev => prev + val);
    }
  };

  const handlePinInput = (num) => {
    if (upiPin.length < 4) {
      const newPin = upiPin + num;
      setUpiPin(newPin);
      
      if (newPin.length === 4) {
        // Trigger simulated payment processing
        setP2pStep(4);
        setTimeout(() => {
          // Deduct from wallet balance
          const amt = parseInt(transferAmount);
          setWalletBalance(prev => prev - amt);
          
          // Generate a reward scratch cashback
          const cashback = Math.floor(Math.random() * 50) + 5; // ₹5 to ₹55
          setCashbackWon(cashback);
          
          // Add transaction record
          const newTx = {
            id: Date.now(),
            title: `To ${selectedContact.name}`,
            amount: amt,
            type: 'debit',
            date: 'Just now',
            category: 'P2P'
          };
          setTransactions([newTx, ...transactions]);
          
          setP2pStep(5);
        }, 1500);
      }
    }
  };

  const completeTransfer = () => {
    // Add cashback to wallet
    setWalletBalance(prev => prev + cashbackWon);
    const cashbackTx = {
      id: Date.now() + 1,
      title: 'PayEase Scratch Cashback',
      amount: cashbackWon,
      type: 'credit',
      date: 'Just now',
      category: 'Rewards'
    };
    setTransactions(prev => [cashbackTx, ...prev]);
    
    // Reset states
    setSelectedContact(null);
    setTransferAmount('');
    setTransferNote('');
    setUpiPin('');
    setScratched(false);
    setP2pStep(1);
    setActiveScreen('wallet');
  };

  // Utility Bill Payment flow trigger
  const triggerBillPayment = (type, amt) => {
    setSelectedBillType(type);
    setBillAmount(amt);
    setTransferAmount(amt.toString());
    
    // Auto configure a contact representing the utility bill
    setSelectedContact({
      name: `${type.toUpperCase()} Authority`,
      phone: 'Utility payment aggregator',
      initial: type.charAt(0).toUpperCase(),
      color: '#06b6d4'
    });
    
    setP2pStep(2); // Jump straight to amount review/note
    setActiveScreen('p2p');
  };

  // Merchant Dashboard functions
  const handleQrGeneration = () => {
    if (!qrAmount) return;
    setGeneratedQr(true);
    
    // Simulate customer scanning the QR code and paying after 4 seconds
    setTimeout(() => {
      const amt = parseInt(qrAmount);
      setMerchantBalance(prev => prev + amt);
      
      const newMerchantTx = {
        id: Date.now(),
        title: `Received via Payment QR`,
        amount: amt,
        type: 'credit',
        date: 'Just now'
      };
      setMerchantTransactions(prev => [newMerchantTx, ...prev]);
      
      // Reset QR input
      setQrAmount('');
      setGeneratedQr(false);
      setActiveScreen('merchant-dash');
    }, 4000);
  };

  return (
    <div className="app-container">
      {/* HEADER NAVBAR */}
      <header className="app-header">
        <div className="brand-section">
          <div className="brand-logo">
            <Wallet size={20} />
          </div>
          <div>
            <h1 className="brand-title">PayEase</h1>
            <span className="brand-badge">PRODUCT MANAGEMENT WORKSPACE</span>
          </div>
        </div>
        <div className="header-links">
          <button 
            className="header-btn"
            onClick={() => {
              // Copy mock portfolio link
              navigator.clipboard.writeText(window.location.href);
              alert("Public Portfolio demo link copied to clipboard!");
            }}
          >
            <Share2 size={16} /> Share Demo
          </button>
          <a 
            href="https://github.com/AASTHA381/PayEase---Digital-Payments-Mobile-App-Product-Requirements-Document-PRD-" 
            target="_blank" 
            rel="noopener noreferrer" 
            className="header-btn primary-btn"
          >
            Original Repo <ChevronRight size={16} />
          </a>
        </div>
      </header>

      {/* WORKSPACE CONTENT GRID */}
      <main className="workspace-grid">
        
        {/* LEFT PANEL: MOBILE SIMULATOR */}
        <section className="phone-simulator-wrapper">
          <div className="phone-mockup">
            
            {/* Camera notch */}
            <div className="phone-notch">
              <div className="phone-camera"></div>
            </div>

            {/* Status bar */}
            <div className="phone-status-bar">
              <span>{currentTime}</span>
              <div className="status-icons">
                <ShieldCheck size={12} className="text-emerald-500" />
                <span>5G</span>
                <span>100%</span>
              </div>
            </div>

            {/* Simulated Phone Screens */}
            <div className="phone-screen">
              
              {/* Screen A: WALLET HOME */}
              {activeScreen === 'wallet' && (
                <>
                  <div className="mobile-app-bar">
                    <div className="mobile-profile-pic">PM</div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.2rem' }}>
                      <Sparkles size={14} style={{ color: 'var(--secondary)' }} />
                      <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#fff' }}>PayEase Wallet</span>
                    </div>
                    <Settings size={18} style={{ color: 'var(--text-muted)', cursor: 'pointer' }} />
                  </div>

                  <div className="mobile-hero-card">
                    <div className="wallet-label">Available Wallet Balance</div>
                    <div className="wallet-balance">₹{walletBalance.toLocaleString('en-IN')}</div>
                    
                    <div className="wallet-actions">
                      <button 
                        className="wallet-action-btn"
                        onClick={() => {
                          setP2pStep(1);
                          setActiveScreen('p2p');
                        }}
                      >
                        <Send size={14} /> Send Money
                      </button>
                      <button 
                        className="wallet-action-btn"
                        onClick={() => setActiveScreen('insights')}
                      >
                        <Sparkles size={14} style={{ color: 'var(--secondary)' }} /> AI Coach
                      </button>
                    </div>
                  </div>

                  {/* Quick actions grid */}
                  <div className="quick-actions-grid">
                    <div className="quick-action-item" onClick={() => { setP2pStep(1); setActiveScreen('p2p'); }}>
                      <div className="quick-action-icon-wrapper"><Send size={20} /></div>
                      <span className="quick-action-label">P2P Pay</span>
                    </div>
                    <div className="quick-action-item" onClick={() => setActiveScreen('insights')}>
                      <div className="quick-action-icon-wrapper"><BarChart3 size={20} style={{ color: 'var(--secondary)' }} /></div>
                      <span className="quick-action-label">Budget</span>
                    </div>
                    <div className="quick-action-item" onClick={() => setActiveScreen('bills')}>
                      <div className="quick-action-icon-wrapper"><FileText size={20} /></div>
                      <span className="quick-action-label">Utilities</span>
                    </div>
                    <div className="quick-action-item" onClick={() => {
                      if (simulatorMode === 'user') {
                        setSimulatorMode('merchant');
                        setActiveScreen('merchant-dash');
                      }
                    }}>
                      <div className="quick-action-icon-wrapper"><QrCode size={20} /></div>
                      <span className="quick-action-label">Merchant</span>
                    </div>
                  </div>

                  {/* Spending Category Summary Chart */}
                  <div className="mobile-section-header">
                    <span className="mobile-section-title">This Month Spending</span>
                    <button className="mobile-section-link" onClick={() => setActiveScreen('insights')}>View Breakdown</button>
                  </div>
                  <div style={{ padding: '0 1.25rem 1rem' }}>
                    <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.04)', borderRadius: '12px', padding: '0.75rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                      <svg width="60" height="60" viewBox="0 0 36 36" style={{ transform: 'rotate(-90deg)' }}>
                        <circle cx="18" cy="18" r="15.91" fill="transparent" stroke="var(--border-color)" strokeWidth="3" />
                        <circle cx="18" cy="18" r="15.91" fill="transparent" stroke="var(--primary)" strokeWidth="3" strokeDasharray="40 100" strokeDashoffset="0" />
                        <circle cx="18" cy="18" r="15.91" fill="transparent" stroke="var(--secondary)" strokeWidth="3" strokeDasharray="30 100" strokeDashoffset="-40" />
                        <circle cx="18" cy="18" r="15.91" fill="transparent" stroke="var(--warning)" strokeWidth="3" strokeDasharray="30 100" strokeDashoffset="-70" />
                      </svg>
                      <div>
                        <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#fff' }}>₹4,820 Food & Utility</div>
                        <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>Healthy budget (32% remaining)</span>
                      </div>
                    </div>
                  </div>

                  {/* Transaction history list */}
                  <div className="mobile-section-header">
                    <span className="mobile-section-title">Recent Transactions</span>
                  </div>
                  <div className="mobile-tx-list">
                    {transactions.map(tx => (
                      <div className="mobile-tx-item" key={tx.id}>
                        <div className="tx-info">
                          <div className="tx-avatar">
                            {tx.category === 'Bills' && <FileText size={16} />}
                            {tx.category === 'P2P' && <Users size={16} />}
                            {tx.category === 'Food' && <DollarSign size={16} />}
                            {tx.category === 'Rewards' && <Award size={16} style={{ color: 'var(--warning)' }} />}
                          </div>
                          <div className="tx-details">
                            <span className="tx-title">{tx.title}</span>
                            <span className="tx-date">{tx.date}</span>
                          </div>
                        </div>
                        <span className={`tx-amount ${tx.type}`}>
                          {tx.type === 'debit' ? '-' : '+'}₹{tx.amount}
                        </span>
                      </div>
                    ))}
                  </div>
                </>
              )}

              {/* Screen B: P2P TRANSFER VIEW */}
              {activeScreen === 'p2p' && (
                <div className="p2p-container">
                  <button className="back-btn" onClick={() => { setP2pStep(1); setActiveScreen('wallet'); }}>
                    <ArrowLeft size={16} /> Back to wallet
                  </button>

                  {/* Step 1: Select recipient */}
                  {p2pStep === 1 && (
                    <>
                      <div className="mobile-section-title" style={{ marginBottom: '1rem' }}>Send Money To</div>
                      <div className="contact-selection">
                        <div className="contact-grid">
                          {contacts.map(c => (
                            <div 
                              className="contact-card" 
                              key={c.id}
                              onClick={() => {
                                setSelectedContact(c);
                                setP2pStep(2);
                              }}
                            >
                              <div className="contact-avatar" style={{ backgroundColor: c.color }}>{c.initial}</div>
                              <span className="contact-name">{c.name}</span>
                              <span className="contact-phone">{c.phone.substring(0, 11)}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </>
                  )}

                  {/* Step 2: Keypad Amount Input */}
                  {p2pStep === 2 && selectedContact && (
                    <div className="transfer-editor">
                      <div className="contact-avatar" style={{ backgroundColor: selectedContact.color, width: '60px', height: '60px', fontSize: '1.25rem', marginBottom: '0.5rem' }}>
                        {selectedContact.initial}
                      </div>
                      <span className="mobile-section-title">{selectedContact.name}</span>
                      <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)', marginBottom: '1.5rem' }}>{selectedContact.phone}</span>

                      <div className="amount-input-display">
                        <span className="amount-currency">₹</span>
                        {transferAmount || '0'}
                      </div>

                      <input 
                        type="text" 
                        placeholder="Add optional note (e.g. rent, dinner)" 
                        value={transferNote}
                        onChange={(e) => setTransferNote(e.target.value)}
                        style={{ width: '100%', maxWidth: '240px', background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border-color)', color: '#fff', padding: '0.5rem', borderRadius: '8px', fontSize: '0.75rem', textAlign: 'center', marginBottom: '1rem', outline: 'none' }}
                      />

                      <div className="keypad-grid">
                        {[1, 2, 3, 4, 5, 6, 7, 8, 9, 'C', 0, '⌫'].map(btn => (
                          <button 
                            className="keypad-btn" 
                            key={btn}
                            onClick={() => handleKeypadPress(btn)}
                          >
                            {btn}
                          </button>
                        ))}
                      </div>

                      <button 
                        className="transfer-action-btn"
                        disabled={!transferAmount || parseInt(transferAmount) <= 0 || parseInt(transferAmount) > walletBalance}
                        onClick={() => setP2pStep(3)}
                      >
                        {parseInt(transferAmount) > walletBalance ? 'Insufficient Balance' : `Pay ₹${transferAmount}`}
                      </button>
                    </div>
                  )}

                  {/* Step 3: Enter UPI PIN */}
                  {p2pStep === 3 && selectedContact && (
                    <div className="upi-pin-container">
                      <div className="upi-logo">UPI SECURE</div>
                      <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)' }}>Confirm Transfer of ₹{transferAmount}</span>
                      <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>to {selectedContact.name}</span>

                      <div className="pin-display">
                        {[0, 1, 2, 3].map(index => (
                          <div 
                            className={`pin-dot ${upiPin.length > index ? 'filled' : ''}`} 
                            key={index}
                          />
                        ))}
                      </div>

                      <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)', marginBottom: '2rem' }}>ENTER 4-DIGIT SECURE UPI PIN</span>

                      <div className="keypad-grid">
                        {[1, 2, 3, 4, 5, 6, 7, 8, 9, '', 0, '⌫'].map((btn, idx) => (
                          <button 
                            className="keypad-btn" 
                            key={idx}
                            onClick={() => {
                              if (btn === '⌫') {
                                setUpiPin(prev => prev.slice(0, -1));
                              } else if (btn !== '') {
                                handlePinInput(btn.toString());
                              }
                            }}
                          >
                            {btn}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Step 4: Processing Payment spinner */}
                  {p2pStep === 4 && (
                    <div className="success-screen">
                      <div className="spinner" style={{ width: '60px', height: '60px', border: '4px solid var(--border-color)', borderTopColor: 'var(--primary)', borderRadius: '50%', animation: 'spin 1s linear infinite', marginBottom: '2rem' }} />
                      <style>{`
                        @keyframes spin {
                          to { transform: rotate(360deg); }
                        }
                      `}</style>
                      <span style={{ fontSize: '0.9rem', color: '#fff', fontWeight: 700 }}>Securing payment with Bank...</span>
                      <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '0.5rem' }}>Do not close or press back button</span>
                    </div>
                  )}

                  {/* Step 5: Transfer Success */}
                  {p2pStep === 5 && selectedContact && (
                    <div className="success-screen">
                      <div className="checkmark-circle">
                        <Check size={40} />
                      </div>
                      <h3 className="success-title">Payment Successful</h3>
                      <p className="success-subtitle">₹{transferAmount} paid to {selectedContact.name}</p>

                      {/* Scratch card reward container */}
                      <div className="scratch-card-container" onClick={() => setScratched(true)}>
                        <div className={`scratch-overlay ${scratched ? 'scratched' : ''}`}>
                          <Award size={18} style={{ marginRight: '0.35rem' }} /> Scratch Card Earned!
                        </div>
                        <div className="reward-content">
                          <Award size={36} className="reward-icon" />
                          <span className="reward-title">Cashback Reward</span>
                          <span className="reward-value">₹{cashbackWon} Won</span>
                        </div>
                      </div>

                      <button 
                        className="transfer-action-btn"
                        style={{ marginTop: '2.5rem' }}
                        onClick={completeTransfer}
                      >
                        Claim & Return to Home
                      </button>
                    </div>
                  )}

                </div>
              )}

              {/* Screen C: AI INSIGHTS COACH */}
              {activeScreen === 'insights' && (
                <div className="ai-insights-container">
                  <button className="back-btn" onClick={() => setActiveScreen('wallet')}>
                    <ArrowLeft size={16} /> Back
                  </button>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.25rem' }}>
                    <Sparkles size={20} style={{ color: 'var(--secondary)' }} />
                    <span className="mobile-section-title">AI Finance Copilot</span>
                  </div>

                  {/* SVG Monthly Budget Overview */}
                  <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border-color)', borderRadius: '16px', padding: '1rem', marginBottom: '1rem' }}>
                    <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>August Spend Limit Progress</span>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginTop: '0.25rem' }}>
                      <span style={{ fontSize: '1.25rem', fontWeight: 800, color: '#fff' }}>₹4,820 <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>spent</span></span>
                      <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--primary)' }}>Limit: ₹15,000</span>
                    </div>
                    {/* Budget bar indicator */}
                    <div style={{ width: '100%', height: '8px', background: 'var(--border-color)', borderRadius: '4px', marginTop: '0.5rem', overflow: 'hidden' }}>
                      <div style={{ width: '32%', height: '100%', background: 'var(--gradient-brand)', borderRadius: '4px' }}></div>
                    </div>
                    <span style={{ fontSize: '0.6rem', color: 'var(--success)', display: 'block', marginTop: '0.35rem', fontWeight: 500 }}>✔ Under budget cap by ₹10,180</span>
                  </div>

                  {/* Interactive Chat logs */}
                  <div className="insights-chat-box" ref={chatBoxRef}>
                    {chatLog.map((chat, idx) => (
                      <div key={idx} style={{ display: 'flex', flexDirection: 'column', gap: '0.15rem', alignSelf: chat.sender === 'user' ? 'flex-end' : 'flex-start', maxWidth: '85%', flexShrink: 0 }}>
                        <div className={`chat-bubble ${chat.sender}`} style={{ alignSelf: chat.sender === 'user' ? 'flex-end' : 'flex-start', maxWidth: '100%', marginBottom: 0 }}>
                          {renderFormattedText(chat.text)}
                        </div>
                        
                        {/* Inline recommendation button */}
                        {chat.recommendation && (
                          <button 
                            onClick={() => addBillerFromRecommendation(chat.recommendation)}
                            style={{
                              alignSelf: 'flex-start',
                              background: 'var(--gradient-brand)',
                              border: 'none',
                              color: '#fff',
                              fontSize: '0.6rem',
                              fontWeight: 700,
                              padding: '0.3rem 0.6rem',
                              borderRadius: '12px',
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '0.2rem',
                              boxShadow: 'var(--shadow-glow)',
                              marginTop: '0.2rem',
                              marginBottom: '0.2rem'
                            }}
                          >
                            <Plus size={10} style={{ color: '#fff' }} /> Add to Utilities (₹{chat.recommendation.amount})
                          </button>
                        )}

                        {/* Inline recommendations list buttons */}
                        {chat.recommendationsList && (
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem', marginTop: '0.2rem', marginBottom: '0.2rem' }}>
                            {chat.recommendationsList.map((rec, rIdx) => (
                              <button 
                                key={rIdx}
                                onClick={() => addBillerFromRecommendation(rec)}
                                style={{
                                  background: 'var(--gradient-brand)',
                                  border: 'none',
                                  color: '#fff',
                                  fontSize: '0.6rem',
                                  fontWeight: 700,
                                  padding: '0.3rem 0.5rem',
                                  borderRadius: '12px',
                                  cursor: 'pointer',
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: '0.2rem',
                                  boxShadow: 'var(--shadow-glow)',
                                  width: 'fit-content'
                                }}
                              >
                                <Plus size={8} style={{ color: '#fff' }} /> Add {rec.name.split(' (')[0]} (₹{rec.amount})
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                    {isTyping && (
                      <div className="chat-bubble bot" style={{ display: 'flex', gap: '3px', alignItems: 'center', alignSelf: 'flex-start' }}>
                        <span style={{ width: '4px', height: '4px', backgroundColor: 'var(--text-muted)', borderRadius: '50%', animation: 'bounce 0.8s infinite' }}></span>
                        <span style={{ width: '4px', height: '4px', backgroundColor: 'var(--text-muted)', borderRadius: '50%', animation: 'bounce 0.8s infinite 0.2s' }}></span>
                        <span style={{ width: '4px', height: '4px', backgroundColor: 'var(--text-muted)', borderRadius: '50%', animation: 'bounce 0.8s infinite 0.4s' }}></span>
                      </div>
                    )}
                  </div>

                  {sipStep === 0 ? (
                    <>
                      <span style={{ fontSize: '0.65rem', fontWeight: 700, color: 'var(--text-muted)', marginTop: '0.5rem', marginBottom: '0.25rem' }}>Ask your Financial Assistant:</span>
                      
                      {/* Custom Prompt Input form */}
                      <form onSubmit={handleCustomSubmit} style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.5rem', flexShrink: 0 }}>
                        <input 
                          type="text"
                          placeholder="Type your own question..."
                          value={customPrompt}
                          onChange={(e) => setCustomPrompt(e.target.value)}
                          style={{
                            flex: 1,
                            background: 'rgba(255, 255, 255, 0.03)',
                            border: '1px solid var(--border-color)',
                            color: '#fff',
                            borderRadius: '20px',
                            padding: '0.4rem 0.8rem',
                            fontSize: '0.7rem',
                            outline: 'none'
                          }}
                        />
                        <button 
                          type="submit"
                          disabled={!customPrompt.trim() || isTyping}
                          style={{
                            width: '28px',
                            height: '28px',
                            borderRadius: '50%',
                            background: 'var(--gradient-brand)',
                            border: 'none',
                            color: '#fff',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            cursor: 'pointer',
                            flexShrink: 0
                          }}
                        >
                          <Send size={12} />
                        </button>
                      </form>

                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem', flexShrink: 0 }}>
                        <button className="chat-prompt-pill" onClick={() => handlePromptClick('How can I save ₹2,000 this month?')}>
                          💡 How can I save ₹2,000 this month?
                        </button>
                        <button className="chat-prompt-pill" onClick={() => handlePromptClick('Why is my food spend so high?')}>
                          🍔 Why is my food spend so high?
                        </button>
                        <button className="chat-prompt-pill" onClick={() => handlePromptClick('Will I meet my savings goal?')}>
                          📈 Will I meet my savings goal?
                        </button>
                      </div>
                    </>
                  ) : sipStep === 1 ? (
                    <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border-color)', borderRadius: '12px', padding: '0.75rem', flexShrink: 0 }}>
                      <span style={{ fontSize: '0.65rem', fontWeight: 700, color: 'var(--text-muted)', display: 'block', marginBottom: '0.5rem' }}>Select Risk Profile:</span>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                        <button className="control-pill-btn active" style={{ fontSize: '0.7rem', padding: '0.5rem' }} onClick={() => handleSipRiskSelect('Low Risk (Debt - ~7% return)')}>
                          🛡 Low Risk (Debt Funds)
                        </button>
                        <button className="control-pill-btn active" style={{ fontSize: '0.7rem', padding: '0.5rem' }} onClick={() => handleSipRiskSelect('Medium Risk (Balanced - ~12% return)')}>
                          ⚖ Medium Risk (Balanced Fund)
                        </button>
                        <button className="control-pill-btn active" style={{ fontSize: '0.7rem', padding: '0.5rem' }} onClick={() => handleSipRiskSelect('High Risk (Equity - ~18% return)')}>
                          🚀 High Risk (Equity Growth)
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border-color)', borderRadius: '12px', padding: '0.75rem', flexShrink: 0 }}>
                      <span style={{ fontSize: '0.65rem', fontWeight: 700, color: 'var(--text-muted)', display: 'block', marginBottom: '0.5rem' }}>Select Timeframe:</span>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                        <button className="control-pill-btn active" style={{ fontSize: '0.7rem', padding: '0.5rem' }} onClick={() => handleSipDurationSelect('1 Year', 12)}>
                          📅 Short Term (1 Year / 12 Months)
                        </button>
                        <button className="control-pill-btn active" style={{ fontSize: '0.7rem', padding: '0.5rem' }} onClick={() => handleSipDurationSelect('3 Years', 36)}>
                          ⏳ Medium Term (3 Years / 36 Months)
                        </button>
                        <button className="control-pill-btn active" style={{ fontSize: '0.7rem', padding: '0.5rem' }} onClick={() => handleSipDurationSelect('5+ Years', 60)}>
                          🌟 Long Term (5+ Years / 60 Months)
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Screen D: UTILITIES / BILL PAYMENTS */}
              {activeScreen === 'bills' && (
                <div className="p2p-container">
                  <button className="back-btn" onClick={() => setActiveScreen('wallet')}>
                    <ArrowLeft size={16} /> Back
                  </button>

                  <div className="mobile-section-title" style={{ marginBottom: '1.25rem' }}>Pay Bills & Utilities</div>
                  
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    {billers.map(bill => (
                      <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border-color)', borderRadius: '12px', padding: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }} key={bill.id}>
                        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                          <div style={{ width: '38px', height: '38px', background: bill.color, color: bill.textColor, borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            {bill.icon === 'settings' && <Settings size={18} />}
                            {bill.icon === 'phone' && <Smartphone size={18} />}
                            {bill.icon === 'trend' && <TrendingUp size={18} />}
                            {bill.icon === 'water' && <Compass size={18} />}
                            {bill.icon === 'flame' && <Sparkles size={18} />}
                            {bill.icon === 'file' && <FileText size={18} />}
                          </div>
                          <div>
                            <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#fff' }}>{bill.name}</div>
                            <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>{bill.desc}</span>
                          </div>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                          <div style={{ fontSize: '0.8rem', fontWeight: 700, color: '#fff', marginBottom: '0.25rem' }}>₹{bill.amount.toLocaleString('en-IN')}</div>
                          <button className="wallet-action-btn" style={{ fontSize: '0.65rem', padding: '0.25rem 0.5rem', background: 'var(--gradient-brand)', border: 'none' }} onClick={() => triggerBillPayment(bill.name, bill.amount)}>
                            {bill.actionText || 'Pay'}
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Screen E: MERCHANT DASHBOARD */}
              {activeScreen === 'merchant-dash' && (
                <>
                  <div className="mobile-app-bar">
                    <div className="mobile-profile-pic" style={{ background: 'var(--gradient-brand)' }}>M</div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.2rem' }}>
                      <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#fff' }}>Merchant Workspace</span>
                    </div>
                    <Settings size={18} style={{ color: 'var(--text-muted)', cursor: 'pointer' }} />
                  </div>

                  <div className="mobile-hero-card" style={{ background: 'linear-gradient(135deg, rgba(16,185,129,0.15) 0%, rgba(6,182,212,0.15) 100%)', borderColor: 'rgba(16,185,129,0.3)' }}>
                    <div className="wallet-label" style={{ color: 'var(--success)' }}>Merchant Account Balance</div>
                    <div className="wallet-balance" style={{ color: '#fff' }}>₹{merchantBalance.toLocaleString('en-IN')}</div>
                    
                    <div className="wallet-actions">
                      <button 
                        className="wallet-action-btn"
                        onClick={() => setActiveScreen('qr-gen')}
                        style={{ background: 'rgba(16,185,129,0.2)', border: '1px solid rgba(16,185,129,0.3)' }}
                      >
                        <QrCode size={14} /> Request UPI QR
                      </button>
                    </div>
                  </div>

                  {/* QR request section inline */}
                  <div className="mobile-section-header">
                    <span className="mobile-section-title">Sales Analytics Overview</span>
                  </div>
                  <div style={{ padding: '0 1.25rem 1rem' }}>
                    <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border-color)', borderRadius: '16px', padding: '1rem' }}>
                      <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>Daily Transaction Volume</span>
                      {/* Bar graph simulated with flex */}
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', height: '60px', marginTop: '0.75rem', padding: '0 0.5rem' }}>
                        <div style={{ width: '12px', height: '35%', backgroundColor: 'var(--primary)', borderRadius: '2px' }}></div>
                        <div style={{ width: '12px', height: '55%', backgroundColor: 'var(--primary)', borderRadius: '2px' }}></div>
                        <div style={{ width: '12px', height: '40%', backgroundColor: 'var(--primary)', borderRadius: '2px' }}></div>
                        <div style={{ width: '12px', height: '80%', backgroundColor: 'var(--secondary)', borderRadius: '2px' }}></div>
                        <div style={{ width: '12px', height: '60%', backgroundColor: 'var(--primary)', borderRadius: '2px' }}></div>
                        <div style={{ width: '12px', height: '95%', backgroundColor: 'var(--success)', borderRadius: '2px' }}></div>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.55rem', color: 'var(--text-muted)', marginTop: '0.25rem', padding: '0 0.25rem' }}>
                        <span>Mon</span><span>Tue</span><span>Wed</span><span>Thu</span><span>Fri</span><span>Sat</span>
                      </div>
                    </div>
                  </div>

                  <div className="mobile-section-header">
                    <span className="mobile-section-title">Live Transactions (Payments Received)</span>
                  </div>
                  <div className="mobile-tx-list">
                    {merchantTransactions.map(tx => (
                      <div className="mobile-tx-item" key={tx.id} style={{ borderLeft: '3px solid var(--success)' }}>
                        <div className="tx-info">
                          <div className="tx-avatar" style={{ backgroundColor: 'rgba(16,185,129,0.1)', color: 'var(--success)' }}>
                            <CheckCircle2 size={16} />
                          </div>
                          <div className="tx-details">
                            <span className="tx-title">{tx.title}</span>
                            <span className="tx-date">{tx.date}</span>
                          </div>
                        </div>
                        <span className="tx-amount credit">+₹{tx.amount}</span>
                      </div>
                    ))}
                  </div>
                </>
              )}

              {/* Screen F: QR CODE PAYMENT GENERATOR */}
              {activeScreen === 'qr-gen' && (
                <div className="p2p-container" style={{ paddingBottom: '0' }}>
                  <button className="back-btn" onClick={() => setActiveScreen('merchant-dash')}>
                    <ArrowLeft size={16} /> Back
                  </button>

                  <div className="mobile-section-title" style={{ marginBottom: '1rem' }}>Generate Payment QR</div>
                  
                  {!generatedQr ? (
                    <div className="transfer-editor" style={{ justifyContent: 'center' }}>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>Specify billing amount for customer</span>
                      
                      <div className="amount-input-display" style={{ margin: '1rem 0' }}>
                        <span className="amount-currency">₹</span>
                        {qrAmount || '0'}
                      </div>

                      <div className="keypad-grid" style={{ marginBottom: '1rem' }}>
                        {[1, 2, 3, 4, 5, 6, 7, 8, 9, 'C', 0, '⌫'].map(btn => (
                          <button 
                            className="keypad-btn" 
                            key={btn}
                            onClick={() => {
                              if (btn === 'C') setQrAmount('');
                              else if (btn === '⌫') setQrAmount(prev => prev.slice(0, -1));
                              else {
                                if (qrAmount.length >= 6) return;
                                setQrAmount(prev => prev + btn);
                              }
                            }}
                          >
                            {btn}
                          </button>
                        ))}
                      </div>

                      <button 
                        className="transfer-action-btn"
                        style={{ background: 'var(--gradient-brand)' }}
                        disabled={!qrAmount || parseInt(qrAmount) <= 0}
                        onClick={handleQrGeneration}
                      >
                        Generate Secure UPI QR
                      </button>
                    </div>
                  ) : (
                    <div className="success-screen">
                      <div className="qr-container">
                        <div className="qr-code-placeholder">
                          <QrCode size={120} style={{ color: '#000' }} />
                          <div className="qr-scan-line"></div>
                        </div>
                        <div className="qr-brand-label">PayEase Merchant Pay</div>
                        <div style={{ fontSize: '0.95rem', fontWeight: 800, marginTop: '0.25rem', fontFamily: 'var(--font-sans)' }}>₹{qrAmount}</div>
                      </div>

                      <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Scanning in progress...</span>
                      <span style={{ fontSize: '0.6rem', color: 'var(--text-muted)', marginTop: '0.25rem', fontStyle: 'italic' }}>Simulating customer checkout, balance will adjust automatically in 4s.</span>
                    </div>
                  )}
                </div>
              )}

            </div>

            {/* Bottom Nav Bar */}
            <div className="phone-bottom-nav">
              <button 
                className={`phone-nav-item ${activeScreen === 'wallet' || activeScreen === 'p2p' || activeScreen === 'bills' ? 'active' : ''}`}
                onClick={() => {
                  setSimulatorMode('user');
                  setActiveScreen('wallet');
                }}
              >
                <Wallet size={18} />
                <span className="phone-nav-label">Payments</span>
              </button>
              <button 
                className={`phone-nav-item ${activeScreen === 'insights' ? 'active' : ''}`}
                onClick={() => {
                  setSimulatorMode('user');
                  setActiveScreen('insights');
                }}
              >
                <Sparkles size={18} />
                <span className="phone-nav-label">AI Coach</span>
              </button>
              <button 
                className={`phone-nav-item ${activeScreen === 'merchant-dash' || activeScreen === 'qr-gen' ? 'active' : ''}`}
                onClick={() => {
                  setSimulatorMode('merchant');
                  setActiveScreen('merchant-dash');
                }}
              >
                <QrCode size={18} />
                <span className="phone-nav-label">Merchant</span>
              </button>
            </div>

          </div>

          {/* Mode indicators */}
          <div className="simulator-controls">
            <button 
              className={`control-pill-btn ${simulatorMode === 'user' ? 'active' : ''}`}
              onClick={() => {
                setSimulatorMode('user');
                setActiveScreen('wallet');
              }}
            >
              <Smartphone size={14} /> User Mode
            </button>
            <button 
              className={`control-pill-btn ${simulatorMode === 'merchant' ? 'active' : ''}`}
              onClick={() => {
                setSimulatorMode('merchant');
                setActiveScreen('merchant-dash');
              }}
            >
              <Users size={14} /> Merchant Mode
            </button>
          </div>
        </section>

        {/* RIGHT PANEL: PORTFOLIO MAIN WORKSPACE */}
        <section className="portfolio-card">
          
          {/* Tab Navigation */}
          <div className="portfolio-nav-bar">
            <button 
              className={`portfolio-nav-tab ${portfolioTab === 'prd' ? 'active' : ''}`}
              onClick={() => setPortfolioTab('prd')}
            >
              <FileText size={16} /> Interactive PRD
            </button>
            <button 
              className={`portfolio-nav-tab ${portfolioTab === 'backlog' ? 'active' : ''}`}
              onClick={() => setPortfolioTab('backlog')}
            >
              <Sliders size={16} /> Dynamic Backlog
            </button>
            <button 
              className={`portfolio-nav-tab ${portfolioTab === 'metrics' ? 'active' : ''}`}
              onClick={() => setPortfolioTab('metrics')}
            >
              <BarChart3 size={16} /> KPIs & Unit Economics
            </button>
            <button 
              className={`portfolio-nav-tab ${portfolioTab === 'roadmap' ? 'active' : ''}`}
              onClick={() => setPortfolioTab('roadmap')}
            >
              <Compass size={16} /> 18M Roadmap
            </button>
          </div>

          {/* Tab Content Display */}
          <div className="portfolio-content-area">
            
            {/* TAB 1: INTERACTIVE PRD VIEWER */}
            {portfolioTab === 'prd' && (
              <div className="prd-layout">
                <nav className="prd-sidebar">
                  <button className={`prd-toc-item ${prdSection === 'exec' ? 'active' : ''}`} onClick={() => setPrdSection('exec')}>
                    1. Exec Summary
                  </button>
                  <button className={`prd-toc-item ${prdSection === 'personas' ? 'active' : ''}`} onClick={() => setPrdSection('personas')}>
                    2. User Personas
                  </button>
                  <button className={`prd-toc-item ${prdSection === 'features' ? 'active' : ''}`} onClick={() => setPrdSection('features')}>
                    3. Key Features
                  </button>
                  <button className={`prd-toc-item ${prdSection === 'tech' ? 'active' : ''}`} onClick={() => setPrdSection('tech')}>
                    4. Technical Architecture
                  </button>
                  <button className={`prd-toc-item ${prdSection === 'gtm' ? 'active' : ''}`} onClick={() => setPrdSection('gtm')}>
                    5. GTM & Business Case
                  </button>
                </nav>

                <div className="prd-document">
                  
                  {prdSection === 'exec' && (
                    <>
                      <h2 className="prd-heading">1. Executive Summary & Market Context</h2>
                      <p className="prd-text">
                        The Indian fintech payments market is currently projected to cross <strong>$500 Billion</strong> in transaction volume by 2025. While market dominance is held by PhonePe and Google Pay, user research identifies severe gaps in transaction success rates, unified billing interfaces, and financial transparency.
                      </p>
                      <p className="prd-text">
                        <strong>PayEase</strong> is a next-generation payments application designed with an intelligence-first layer. By integrating instant offline P2P transactions and a budget advisory copilot directly with the NPCI/UPI gateways, PayEase targets 1% market share ($500M monthly TPV) in Tier 2 and Tier 3 cities within 18 months of launch.
                      </p>
                      <div className="prd-quote">
                        <strong>Goal Statement:</strong> Establish PayEase as the most reliable digital payment wallet for daily retail transfers and budget tracking across Indian regional centers.
                      </div>
                    </>
                  )}

                  {prdSection === 'personas' && (
                    <>
                      <h2 className="prd-heading">2. User Personas & Pain Points</h2>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border-color)', borderRadius: '12px', padding: '1rem' }}>
                          <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--secondary)' }}>PERSONA A: SNEHA, THE LOCAL MERCHANT (AGE 34, JAIPUR)</span>
                          <p className="prd-text" style={{ marginTop: '0.5rem', marginBottom: '0' }}>
                            <strong>Needs:</strong> Reliable QR settlements, low failure rates during peak retail hours, clear customer data insights.
                            <br />
                            <strong>Pain Points:</strong> Fragmented merchant dashboards, delayed payouts, and lack of customer retention channels.
                          </p>
                        </div>
                        <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border-color)', borderRadius: '12px', padding: '1rem' }}>
                          <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--primary)' }}>PERSONA B: AMAN, THE YOUNG PROFESSIONAL (AGE 24, METRO)</span>
                          <p className="prd-text" style={{ marginTop: '0.5rem', marginBottom: '0' }}>
                            <strong>Needs:</strong> Swift P2P splits, automated monthly bill reminders, zero fee transfers.
                            <br />
                            <strong>Pain Points:</strong> App bloat, separate apps for expense tracking, confusing security disclosures.
                          </p>
                        </div>
                      </div>
                    </>
                  )}

                  {prdSection === 'features' && (
                    <>
                      <h2 className="prd-heading">3. Feature Specifications</h2>
                      
                      <h3 className="prd-subheading">A. AI Spending Insights & Alerts</h3>
                      <p className="prd-text">
                        Automatically classifies outgoing UPI debits (SMS parsing & transaction hooks) into categories: Food, Travel, Bills, Shopping. Alerts users when category expenditure crosses pre-defined threshold bars.
                      </p>
                      <div className="prd-quote">
                        <strong>Product Metric:</strong> Increase daily active retention (DAU) by providing immediate budget feedback via the chatbot.
                      </div>

                      <h3 className="prd-subheading">B. Smart QR Request Terminal</h3>
                      <p className="prd-text">
                        Enables offline and micro-merchants to instantly generate amounts in secure QR grids. Provides real-time notifications to customer mobile phones.
                      </p>
                    </>
                  )}

                  {prdSection === 'tech' && (
                    <>
                      <h2 className="prd-heading">4. Technical Architecture</h2>
                      <p className="prd-text">
                        The application leverages a microservices backend to guarantee scale.
                      </p>
                      <ul style={{ paddingLeft: '1.25rem', color: 'var(--text-muted)', fontSize: '0.9rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                        <li><strong>Frontend:</strong> React Native framework mapping Native iOS & Android UI controllers.</li>
                        <li><strong>Transaction Database:</strong> PostgreSQL cluster implementing ACID compliance to ensure zero transaction mismatch.</li>
                        <li><strong>Insights Engine:</strong> PyTorch models compiled for light edge inference on budgets and financial guidance.</li>
                        <li><strong>APIs:</strong> Standard REST endpoints secured via AES-256 encryption.</li>
                      </ul>
                      <div className="prd-quote" style={{ marginTop: '1rem' }}>
                        <strong>Security Standard:</strong> Adheres fully to RBI tokenization policies and PCI DSS compliance guidelines.
                      </div>
                    </>
                  )}

                  {prdSection === 'gtm' && (
                    <>
                      <h2 className="prd-heading">5. GTM & Business Case</h2>
                      <p className="prd-text">
                        Our Go-to-Market strategy operates on a phased regional launch to optimize customer acquisition costs:
                      </p>
                      <ul style={{ paddingLeft: '1.25rem', color: 'var(--text-muted)', fontSize: '0.9rem', display: 'flex', flexDirection: 'column', gap: '0.5rem', marginBottom: '1rem' }}>
                        <li><strong>Months 1-3 (Soft Launch):</strong> Rollout to 10 tier-2 cities across Western India. Recruit 10,000 local merchants using localized campaigns.</li>
                        <li><strong>Months 4-12 (National Scale):</strong> Launch digital reward programs and referral cashback schemes to drive viral user loop.</li>
                        <li><strong>Monetization Framework:</strong> Free core P2P payments. Revenue is generated via merchant advertising, premium budget insights, and bill payment commissions.</li>
                      </ul>
                    </>
                  )}

                </div>
              </div>
            )}

            {/* TAB 2: INTERACTIVE RICE PRIORITIZATION BACKLOG */}
            {portfolioTab === 'backlog' && (
              <div>
                <div className="backlog-header">
                  <div>
                    <h2 className="prd-heading" style={{ margin: '0' }}>Feature Prioritization Backlog</h2>
                    <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Adjust the RICE variables below to recalculate scores and re-sort priority list dynamically.</p>
                  </div>
                  <button className="backlog-btn" onClick={exportBacklogToCsv}>
                    <Download size={14} /> Export CSV
                  </button>
                </div>

                <div className="backlog-table-wrapper">
                  <table className="backlog-table">
                    <thead>
                      <tr>
                        <th>Rank</th>
                        <th>Feature Name</th>
                        <th>Reach (Audience)</th>
                        <th>Impact (1-3)</th>
                        <th>Confidence %</th>
                        <th>Effort (Months)</th>
                        <th>RICE Score</th>
                        <th>MoSCoW</th>
                      </tr>
                    </thead>
                    <tbody>
                      {sortedBacklog.map((item, index) => (
                        <tr key={item.id}>
                          <td style={{ fontWeight: 800, color: '#fff' }}>#{index + 1}</td>
                          <td style={{ fontWeight: 600, color: '#fff' }}>{item.name}</td>
                          <td>
                            <input 
                              type="number" 
                              className="rice-input"
                              value={item.reach}
                              onChange={(e) => handleRiceChange(item.id, 'reach', e.target.value)}
                            />
                          </td>
                          <td>
                            <input 
                              type="number" 
                              step="0.5"
                              className="rice-input"
                              value={item.impact}
                              onChange={(e) => handleRiceChange(item.id, 'impact', e.target.value)}
                            />
                          </td>
                          <td>
                            <input 
                              type="number" 
                              step="0.05"
                              className="rice-input"
                              value={item.confidence}
                              onChange={(e) => handleRiceChange(item.id, 'confidence', e.target.value)}
                            />
                          </td>
                          <td>
                            <input 
                              type="number" 
                              className="rice-input"
                              value={item.effort}
                              onChange={(e) => handleRiceChange(item.id, 'effort', e.target.value)}
                            />
                          </td>
                          <td>
                            <span className="score-badge">{getRiceScore(item)}</span>
                          </td>
                          <td>
                            <span className={`feature-badge moscow-${item.moscow.toLowerCase()}`}>
                              {item.moscow}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div style={{ marginTop: '1rem', background: 'rgba(255,255,255,0.02)', padding: '1rem', borderRadius: '12px', border: '1px solid var(--border-color)', display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                  <Info size={24} style={{ color: 'var(--primary)', flexShrink: 0 }} />
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                    <strong>RICE Scoring Guide:</strong> Score is computed as <code>(Reach × Impact × Confidence) / Effort</code>. Higher scores signify features that present maximum strategic return for equivalent developer allocation.
                  </span>
                </div>
              </div>
            )}

            {/* TAB 3: KPIs & FINANCIAL ECONOMICS MODEL */}
            {portfolioTab === 'metrics' && (
              <div>
                <h2 className="prd-heading">PayEase Success Metrics Dashboard</h2>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '1.5rem' }}>Projections from Month 18 launch business model plan.</p>

                <div className="metrics-grid">
                  <div className="metric-card">
                    <span className="metric-card-title">Projected MAU (M18)</span>
                    <div className="metric-card-value">1.5 Million</div>
                  </div>
                  <div className="metric-card">
                    <span className="metric-card-title">Target TPV (Monthly)</span>
                    <div className="metric-card-value">$500 Million</div>
                  </div>
                  <div className="metric-card">
                    <span className="metric-card-title">Transaction Uptime KPI</span>
                    <div className="metric-card-value">99.5%</div>
                  </div>
                </div>

                <div className="calculator-section">
                  <h3 className="calculator-title">Unit Economics Sandbox</h3>
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '1.25rem' }}>Use the inputs to test customer lifecycle ratios based on research models.</p>
                  
                  <div className="calculator-row">
                    <div className="calculator-label-row">
                      <span>Customer Acquisition Cost (CAC)</span>
                      <span style={{ color: '#fff', fontWeight: 700 }}>${sliderCac}</span>
                    </div>
                    <input 
                      type="range" 
                      min="2" 
                      max="20" 
                      className="calculator-slider"
                      value={sliderCac}
                      onChange={(e) => setSliderCac(parseInt(e.target.value))}
                    />
                  </div>

                  <div className="calculator-row">
                    <div className="calculator-label-row">
                      <span>Average Monthly Revenue Per User (ARPU)</span>
                      <span style={{ color: '#fff', fontWeight: 700 }}>${sliderArpu}</span>
                    </div>
                    <input 
                      type="range" 
                      min="5" 
                      max="60" 
                      className="calculator-slider"
                      value={sliderArpu}
                      onChange={(e) => setSliderArpu(parseInt(e.target.value))}
                    />
                  </div>

                  <div className="calculator-row">
                    <div className="calculator-label-row">
                      <span>Monthly Retention Rate</span>
                      <span style={{ color: '#fff', fontWeight: 700 }}>{sliderRetention}%</span>
                    </div>
                    <input 
                      type="range" 
                      min="10" 
                      max="95" 
                      className="calculator-slider"
                      value={sliderRetention}
                      onChange={(e) => setSliderRetention(parseInt(e.target.value))}
                    />
                  </div>

                  <div className="ltv-display-card">
                    <div>
                      <div className="ltv-ratio-label">Simulated LTV : CAC Ratio</div>
                      <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>
                        Calculated Lifetime Value: ${ltvVal} (Churn: {100 - sliderRetention}%)
                      </span>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0.25rem' }}>
                      <span className="ltv-ratio-value">{ltvCacRatio} : 1</span>
                      <span className={`feature-badge ${getRatioBadgeStyle().class}`}>
                        {getRatioBadgeStyle().label}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 4: 18-MONTH ROADMAP TIMELINE */}
            {portfolioTab === 'roadmap' && (
              <div className="roadmap-container">
                <h2 className="prd-heading" style={{ marginBottom: '0' }}>18-Month Phased Roadmap</h2>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>Roadmap alignment mapping core requirements to execution phases.</p>

                <div className="roadmap-phase-card">
                  <div className="roadmap-phase-header">
                    <span className="roadmap-phase-title">Phase 1: Core Payments Infrastructure MVP</span>
                    <span className="roadmap-phase-timeline">Months 1 - 6</span>
                  </div>
                  <p className="prd-text" style={{ marginBottom: '0' }}>
                    <strong>Key Focus:</strong> Build core digital payment Rails, establish direct secure gateway handshake with partner banks, support P2P contact payments and utility bills aggregator. Launch Android/iOS apps in 10 pilot cities.
                  </p>
                </div>

                <div className="roadmap-phase-card">
                  <div className="roadmap-phase-header">
                    <span className="roadmap-phase-title">Phase 2: AI Financial Insights & Value Add Features</span>
                    <span className="roadmap-phase-timeline">Months 7 - 12</span>
                  </div>
                  <p className="prd-text" style={{ marginBottom: '0' }}>
                    <strong>Key Focus:</strong> Integrate AI Budget coach backend service to trigger spending category alerts. Add offline balance transfers and split-bill QR integrations. Launch viral cashback referral loops.
                  </p>
                </div>

                <div className="roadmap-phase-card">
                  <div className="roadmap-phase-header">
                    <span className="roadmap-phase-title">Phase 3: Merchant Services & High-Yield Pocket Scaling</span>
                    <span className="roadmap-phase-timeline">Months 13 - 18</span>
                  </div>
                  <p className="prd-text" style={{ marginBottom: '0' }}>
                    <strong>Key Focus:</strong> Deploy complete business onboarding tools, real-time payouts terminal, and localized voice guidance. Partner with local banks to launch credit pocket products.
                  </p>
                </div>
              </div>
            )}

          </div>
        </section>

      </main>

      {/* FOOTER */}
      <footer className="app-footer">
        <p>© 2026 PayEase Fintech Mobile App Portfolio Sandbox. Designed by Google Deepmind Team with Aastha Saini.</p>
      </footer>
    </div>
  );
}
