import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Slider } from '@/components/ui/slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import Icon from '@/components/ui/icon';

type GameState = 'menu' | 'lobby' | 'teamSelect' | 'game';
type Team = 'ct' | 't' | null;
type Difficulty = 'easy' | 'medium' | 'hard' | 'expert';

interface Weapon {
  id: string;
  name: string;
  price: number;
  ammo: number;
  reserve: number;
  category: 'pistol' | 'shotgun' | 'rifle' | 'smg' | 'lmg';
  damage: number;
}

interface Bot {
  id: number;
  x: number;
  y: number;
  health: number;
  team: 'ct' | 't';
}

const weapons: Weapon[] = [
  { id: 'glock', name: 'Glock-18', price: 0, ammo: 20, reserve: 90, category: 'pistol', damage: 28 },
  { id: 'usp', name: 'USP-S', price: 200, ammo: 12, reserve: 100, category: 'pistol', damage: 35 },
  { id: 'deagle', name: 'Desert Eagle', price: 700, ammo: 7, reserve: 35, category: 'pistol', damage: 53 },
  { id: 'nova', name: 'Nova', price: 1050, ammo: 8, reserve: 32, category: 'shotgun', damage: 26 },
  { id: 'xm1014', name: 'XM1014', price: 2000, ammo: 7, reserve: 32, category: 'shotgun', damage: 20 },
  { id: 'ak47', name: 'AK-47', price: 2700, ammo: 30, reserve: 90, category: 'rifle', damage: 36 },
  { id: 'm4a1', name: 'M4A1-S', price: 2900, ammo: 25, reserve: 75, category: 'rifle', damage: 33 },
  { id: 'awp', name: 'AWP', price: 4750, ammo: 10, reserve: 30, category: 'rifle', damage: 115 },
  { id: 'mp9', name: 'MP9', price: 1250, ammo: 30, reserve: 120, category: 'smg', damage: 26 },
  { id: 'm249', name: 'M249', price: 5200, ammo: 100, reserve: 200, category: 'lmg', damage: 32 },
];

export default function Index() {
  const [gameState, setGameState] = useState<GameState>('menu');
  const [botCount, setBotCount] = useState([10]);
  const [difficulty, setDifficulty] = useState<Difficulty>('medium');
  const [team, setTeam] = useState<Team>(null);
  const [money, setMoney] = useState(800);
  const [currentWeapon, setCurrentWeapon] = useState<Weapon>(weapons[0]);
  const [inventory, setInventory] = useState<Weapon[]>([weapons[0]]);
  const [showShop, setShowShop] = useState(false);
  const [health, setHealth] = useState(100);
  const [armor, setArmor] = useState(0);
  const [playerX, setPlayerX] = useState(50);
  const [playerY, setPlayerY] = useState(50);
  const [bots, setBots] = useState<Bot[]>([]);
  const [kills, setKills] = useState(0);
  const [deaths, setDeaths] = useState(0);
  const [keysPressed, setKeysPressed] = useState<Set<string>>(new Set());
  const [showConsole, setShowConsole] = useState(false);
  const [consoleInput, setConsoleInput] = useState('');
  const [consoleHistory, setConsoleHistory] = useState<string[]>(['Консоль готова. Введите команду...']);
  const [fpsMax, setFpsMax] = useState(60);
  const [currentFps, setCurrentFps] = useState(60);

  useEffect(() => {
    if (gameState === 'game' && bots.length === 0) {
      const newBots: Bot[] = [];
      for (let i = 0; i < botCount[0]; i++) {
        newBots.push({
          id: i,
          x: Math.random() * 80 + 10,
          y: Math.random() * 60 + 20,
          health: 100,
          team: i % 2 === 0 ? 'ct' : 't',
        });
      }
      setBots(newBots);
    }
  }, [gameState, botCount, bots.length]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (gameState === 'game' && e.key === '`') {
        setShowConsole(!showConsole);
        return;
      }
      if (showConsole && e.key === 'Escape') {
        setShowConsole(false);
        return;
      }
      if (gameState === 'game' && !showConsole && (e.key === 'b' || e.key === 'B' || e.key === 'и' || e.key === 'И')) {
        setShowShop(!showShop);
        return;
      }
      if (showShop && e.key === 'Escape') {
        setShowShop(false);
        return;
      }
      if (gameState === 'game' && !showShop && !showConsole) {
        setKeysPressed(prev => new Set(prev).add(e.key.toLowerCase()));
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      setKeysPressed(prev => {
        const newSet = new Set(prev);
        newSet.delete(e.key.toLowerCase());
        return newSet;
      });
    };

    const handleClick = () => {
      if (gameState === 'game' && !showShop && !showConsole && currentWeapon.ammo > 0) {
        setCurrentWeapon({ ...currentWeapon, ammo: currentWeapon.ammo - 1 });
        
        const nearestBot = bots
          .filter(b => b.health > 0 && b.team !== team)
          .sort((a, b) => {
            const distA = Math.sqrt((a.x - playerX) ** 2 + (a.y - playerY) ** 2);
            const distB = Math.sqrt((b.x - playerX) ** 2 + (b.y - playerY) ** 2);
            return distA - distB;
          })[0];

        if (nearestBot) {
          const distance = Math.sqrt((nearestBot.x - playerX) ** 2 + (nearestBot.y - playerY) ** 2);
          if (distance < 40) {
            setBots(bots.map(b => {
              if (b.id === nearestBot.id) {
                const newHealth = b.health - currentWeapon.damage;
                if (newHealth <= 0) {
                  setKills(kills + 1);
                  setMoney(money + 300);
                  return { ...b, health: 0 };
                }
                return { ...b, health: newHealth };
              }
              return b;
            }));
          }
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    window.addEventListener('click', handleClick);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      window.removeEventListener('click', handleClick);
    };
  }, [gameState, showShop, showConsole, currentWeapon, bots, playerX, playerY, team, kills, money]);

  useEffect(() => {
    if (gameState !== 'game' || showShop || showConsole) return;

    const frameTime = 1000 / fpsMax;
    const moveInterval = setInterval(() => {
      const speed = 0.8;
      let newX = playerX;
      let newY = playerY;

      if (keysPressed.has('w') || keysPressed.has('ц')) newY -= speed;
      if (keysPressed.has('s') || keysPressed.has('ы')) newY += speed;
      if (keysPressed.has('a') || keysPressed.has('ф')) newX -= speed;
      if (keysPressed.has('d') || keysPressed.has('в')) newX += speed;

      newX = Math.max(5, Math.min(95, newX));
      newY = Math.max(10, Math.min(90, newY));

      if (newX !== playerX || newY !== playerY) {
        setPlayerX(newX);
        setPlayerY(newY);
      }
    }, frameTime);

    return () => clearInterval(moveInterval);
  }, [gameState, showShop, showConsole, keysPressed, playerX, playerY, fpsMax]);

  useEffect(() => {
    if (gameState !== 'game') return;

    let lastTime = performance.now();
    let frameCount = 0;

    const fpsInterval = setInterval(() => {
      const now = performance.now();
      const delta = now - lastTime;
      const fps = Math.round((frameCount * 1000) / delta);
      setCurrentFps(fps);
      frameCount = 0;
      lastTime = now;
    }, 1000);

    const countFrame = () => {
      frameCount++;
      requestAnimationFrame(countFrame);
    };
    countFrame();

    return () => clearInterval(fpsInterval);
  }, [gameState]);

  const handleConsoleCommand = (command: string) => {
    const trimmed = command.trim().toLowerCase();
    const newHistory = [...consoleHistory];

    newHistory.push(`> ${command}`);

    if (trimmed.startsWith('fps_max')) {
      const parts = trimmed.split(' ');
      if (parts.length === 2) {
        const value = parseInt(parts[1]);
        if (!isNaN(value) && value > 0 && value <= 500) {
          setFpsMax(value);
          newHistory.push(`✓ FPS ограничен до ${value}`);
        } else {
          newHistory.push('✗ Ошибка: значение должно быть от 1 до 500');
        }
      } else {
        newHistory.push(`FPS Max: ${fpsMax}`);
      }
    } else if (trimmed === 'help' || trimmed === 'помощь') {
      newHistory.push('Доступные команды:');
      newHistory.push('  fps_max [число] - установить максимальный FPS (1-500)');
      newHistory.push('  clear - очистить консоль');
      newHistory.push('  help - показать эту справку');
    } else if (trimmed === 'clear' || trimmed === 'cls') {
      setConsoleHistory(['Консоль очищена']);
      setConsoleInput('');
      return;
    } else if (trimmed !== '') {
      newHistory.push(`✗ Неизвестная команда: ${command}`);
    }

    setConsoleHistory(newHistory.slice(-20));
    setConsoleInput('');
  };

  const handleBuyWeapon = (weapon: Weapon) => {
    if (money >= weapon.price) {
      setMoney(money - weapon.price);
      setInventory([...inventory.filter(w => w.category !== weapon.category), weapon]);
      setCurrentWeapon(weapon);
      setShowShop(false);
    }
  };

  const handleBuyAmmo = () => {
    if (money >= 100) {
      setMoney(money - 100);
      setCurrentWeapon({ ...currentWeapon, reserve: currentWeapon.reserve + 90 });
    }
  };

  const categoryNames = {
    pistol: 'Пистолеты',
    shotgun: 'Дробовики',
    rifle: 'Винтовки',
    smg: 'Автоматы',
    lmg: 'Пулемёты',
  };

  if (gameState === 'menu') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-card to-background flex items-center justify-center p-4">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxwYXRoIGQ9Ik0zNiAxOGMzLjMxNCAwIDYgMi42ODYgNiA2cy0yLjY4NiA2LTYgNi02LTIuNjg2LTYtNiAyLjY4Ni02IDYtNnoiIHN0cm9rZT0iIzI0MjgzMSIgc3Ryb2tlLXdpZHRoPSIuNSIgb3BhY2l0eT0iLjEiLz48L2c+PC9zdmc+')] opacity-30"></div>
        
        <Card className="relative z-10 w-full max-w-md p-8 bg-card/95 backdrop-blur-sm border-2 border-primary/30 animate-fade-in">
          <div className="text-center space-y-8">
            <div className="space-y-2">
              <h1 className="text-5xl font-bold font-orbitron text-primary tracking-wider">CS 1.6</h1>
              <p className="text-sm text-muted-foreground uppercase tracking-widest">Counter-Strike Clone</p>
            </div>
            
            <div className="space-y-3">
              <Button 
                onClick={() => setGameState('lobby')} 
                className="w-full h-14 text-lg font-semibold bg-primary hover:bg-primary/90 transition-all hover:scale-105"
              >
                <Icon name="Play" className="mr-2" size={20} />
                Играть
              </Button>
              
              <Button 
                variant="outline" 
                className="w-full h-14 text-lg font-semibold border-2 hover:bg-secondary/50 transition-all hover:scale-105"
              >
                <Icon name="Settings" className="mr-2" size={20} />
                Настройки
              </Button>
              
              <Button 
                variant="destructive" 
                className="w-full h-14 text-lg font-semibold transition-all hover:scale-105"
                onClick={() => window.close()}
              >
                <Icon name="LogOut" className="mr-2" size={20} />
                Выйти из игры
              </Button>
            </div>
          </div>
        </Card>
      </div>
    );
  }

  if (gameState === 'lobby') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-card to-background flex items-center justify-center p-4">
        <Card className="w-full max-w-2xl p-8 bg-card/95 backdrop-blur-sm border-2 border-primary/30 animate-fade-in">
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-3xl font-bold font-orbitron text-primary">Настройка игры</h2>
              <Button variant="ghost" onClick={() => setGameState('menu')}>
                <Icon name="X" size={24} />
              </Button>
            </div>

            <div className="space-y-6 bg-secondary/30 p-6 rounded-lg">
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <label className="text-lg font-semibold">Количество ботов</label>
                  <span className="text-2xl font-orbitron text-primary">{botCount[0]}</span>
                </div>
                <Slider 
                  value={botCount} 
                  onValueChange={setBotCount} 
                  min={1} 
                  max={32} 
                  step={1}
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>1</span>
                  <span>32</span>
                </div>
              </div>

              <div className="space-y-3">
                <label className="text-lg font-semibold">Сложность</label>
                <Select value={difficulty} onValueChange={(v) => setDifficulty(v as Difficulty)}>
                  <SelectTrigger className="w-full h-12 text-base">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="easy">Лёгкая</SelectItem>
                    <SelectItem value="medium">Средняя</SelectItem>
                    <SelectItem value="hard">Тяжёлая</SelectItem>
                    <SelectItem value="expert">Эксперт</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="pt-4 space-y-3 border-t border-border">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Icon name="Map" size={20} />
                  <span className="text-base">Карта: <span className="text-primary font-semibold">De_Dust2</span></span>
                </div>
              </div>
            </div>

            <Button 
              onClick={() => setGameState('teamSelect')} 
              className="w-full h-14 text-lg font-semibold bg-primary hover:bg-primary/90 transition-all hover:scale-105"
            >
              <Icon name="Rocket" className="mr-2" size={20} />
              Запустить игру
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  if (gameState === 'teamSelect') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-card to-background flex items-center justify-center p-4">
        <div className="w-full max-w-5xl space-y-6 animate-fade-in">
          <h2 className="text-4xl font-bold font-orbitron text-center text-primary">Выберите команду</h2>
          
          <div className="grid md:grid-cols-2 gap-6">
            <Card 
              className="p-8 bg-gradient-to-br from-primary/20 to-card border-2 border-primary cursor-pointer transition-all hover:scale-105 hover:border-primary hover:shadow-2xl hover:shadow-primary/50"
              onClick={() => {
                setTeam('ct');
                setGameState('game');
              }}
            >
              <div className="text-center space-y-4">
                <div className="text-6xl">🛡️</div>
                <h3 className="text-3xl font-bold font-orbitron text-primary">Спецназ</h3>
                <p className="text-muted-foreground">Counter-Terrorists</p>
                <div className="pt-4">
                  <div className="text-sm text-muted-foreground">Стартовое оружие</div>
                  <div className="text-lg font-semibold">USP-S / M4A1-S</div>
                </div>
              </div>
            </Card>

            <Card 
              className="p-8 bg-gradient-to-br from-destructive/20 to-card border-2 border-destructive cursor-pointer transition-all hover:scale-105 hover:border-destructive hover:shadow-2xl hover:shadow-destructive/50"
              onClick={() => {
                setTeam('t');
                setGameState('game');
              }}
            >
              <div className="text-center space-y-4">
                <div className="text-6xl">💣</div>
                <h3 className="text-3xl font-bold font-orbitron text-destructive">Террористы</h3>
                <p className="text-muted-foreground">Terrorists</p>
                <div className="pt-4">
                  <div className="text-sm text-muted-foreground">Стартовое оружие</div>
                  <div className="text-lg font-semibold">Glock-18 / AK-47</div>
                </div>
              </div>
            </Card>
          </div>

          <div className="text-center">
            <Button variant="outline" onClick={() => setGameState('lobby')}>
              <Icon name="ArrowLeft" className="mr-2" size={20} />
              Назад
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#8B7355] relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-[#87CEEB]/30 to-transparent"></div>
      
      <div className="absolute bottom-0 left-0 right-0 h-1/2 bg-gradient-to-t from-[#C19A6B] to-transparent"></div>
      
      <div className="absolute top-1/3 left-1/4 w-32 h-32 bg-[#A0826D] rounded-lg transform rotate-12"></div>
      <div className="absolute top-1/2 right-1/4 w-24 h-40 bg-[#8B7355] rounded"></div>
      <div className="absolute bottom-1/4 left-1/3 w-48 h-4 bg-[#654321] rounded-full"></div>

      {bots.map(bot => bot.health > 0 && (
        <div 
          key={bot.id}
          className="absolute transition-all duration-100"
          style={{ 
            left: `${bot.x}%`, 
            top: `${bot.y}%`,
            transform: 'translate(-50%, -50%)'
          }}
        >
          <div className="relative">
            <div className={`text-4xl ${bot.team === 'ct' ? 'filter brightness-110' : ''}`}>
              {bot.team === 'ct' ? '🛡️' : '💣'}
            </div>
            <div className="absolute -top-6 left-1/2 -translate-x-1/2 whitespace-nowrap">
              <div className="bg-destructive/90 px-2 py-0.5 rounded text-xs font-orbitron font-bold">
                {Math.ceil(bot.health)}
              </div>
            </div>
          </div>
        </div>
      ))}

      <div 
        className="absolute transition-all duration-75 z-20"
        style={{ 
          left: `${playerX}%`, 
          top: `${playerY}%`,
          transform: 'translate(-50%, -50%)'
        }}
      >
        <div className="text-5xl animate-pulse">
          {team === 'ct' ? '👮' : '🥷'}
        </div>
      </div>

      <div className="relative z-10 p-4">
        <div className="flex justify-between items-start">
          <div className="space-y-2">
            <div className="flex items-center gap-4 bg-card/90 backdrop-blur-sm px-6 py-3 rounded-lg border border-primary/30">
              <div className="flex items-center gap-2">
                <Icon name="Heart" size={24} className="text-destructive" />
                <span className="text-2xl font-orbitron font-bold">{health}</span>
              </div>
              
              <div className="flex items-center gap-2">
                <Icon name="Shield" size={24} className="text-primary" />
                <span className="text-2xl font-orbitron font-bold">{armor}</span>
              </div>
            </div>

            <div className="bg-accent/90 backdrop-blur-sm px-6 py-3 rounded-lg border border-accent">
              <div className="flex items-center gap-2">
                <span className="text-2xl">💰</span>
                <span className="text-2xl font-orbitron font-bold text-black">${money}</span>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <div className="bg-card/90 backdrop-blur-sm px-4 py-2 rounded-lg border border-border">
              <div className="text-center">
                <div className="text-xs text-muted-foreground">Карта</div>
                <div className="text-lg font-semibold">De_Dust2</div>
              </div>
            </div>
            
            <div className="bg-card/90 backdrop-blur-sm px-4 py-2 rounded-lg border border-border">
              <div className="flex items-center justify-center gap-3">
                <div className="text-center">
                  <div className="text-xs text-muted-foreground">Убийства</div>
                  <div className="text-xl font-orbitron font-bold text-accent">{kills}</div>
                </div>
                <div className="text-muted-foreground">/</div>
                <div className="text-center">
                  <div className="text-xs text-muted-foreground">Смерти</div>
                  <div className="text-xl font-orbitron font-bold text-destructive">{deaths}</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="absolute top-8 left-8">
          <div className="bg-card/90 backdrop-blur-sm px-4 py-2 rounded-lg border border-border">
            <div className="text-center">
              <div className="text-xs text-muted-foreground">FPS</div>
              <div className="text-2xl font-orbitron font-bold text-accent">{currentFps}</div>
              <div className="text-xs text-muted-foreground">макс: {fpsMax}</div>
            </div>
          </div>
        </div>

        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 text-center space-y-2">
          <div className="bg-card/90 backdrop-blur-sm px-6 py-2 rounded-lg border border-primary/30">
            <div className="text-sm text-muted-foreground">
              <kbd className="px-2 py-1 bg-secondary rounded font-semibold">WASD</kbd> движение · 
              <kbd className="px-2 py-1 bg-secondary rounded font-semibold ml-2">ЛКМ</kbd> стрельба · 
              <kbd className="px-2 py-1 bg-primary text-primary-foreground rounded font-orbitron font-bold ml-2">B</kbd> магазин · 
              <kbd className="px-2 py-1 bg-secondary rounded font-semibold ml-2">`</kbd> консоль
            </div>
          </div>
        </div>

        <div className="absolute bottom-8 right-8">
          <div className="bg-card/90 backdrop-blur-sm p-6 rounded-lg border-2 border-primary/30 min-w-[280px]">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-lg font-semibold">{currentWeapon.name}</span>
                <Icon name="Crosshair" size={24} className="text-primary" />
              </div>
              
              <div className="flex items-center gap-2">
                <Icon name="Zap" size={20} className="text-muted-foreground" />
                <div className="text-3xl font-orbitron font-bold">
                  {currentWeapon.ammo} <span className="text-muted-foreground text-xl">/ {currentWeapon.reserve}</span>
                </div>
              </div>

              <div className="flex gap-2 pt-2 flex-wrap">
                {inventory.map((weapon) => (
                  <Button
                    key={weapon.id}
                    size="sm"
                    variant={weapon.id === currentWeapon.id ? 'default' : 'outline'}
                    onClick={() => setCurrentWeapon(weapon)}
                    className="font-semibold text-xs"
                  >
                    {weapon.name}
                  </Button>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="absolute top-8 left-1/2 -translate-x-1/2">
          <Button 
            variant="outline" 
            onClick={() => setGameState('menu')}
            className="bg-card/90 backdrop-blur-sm"
          >
            <Icon name="Menu" className="mr-2" size={20} />
            Меню
          </Button>
        </div>
      </div>

      {showShop && (
        <div className="absolute inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
          <Card className="w-full max-w-4xl max-h-[90vh] overflow-y-auto bg-card border-2 border-primary">
            <div className="p-6 space-y-6">
              <div className="flex items-center justify-between border-b border-border pb-4">
                <div>
                  <h2 className="text-3xl font-bold font-orbitron text-primary">Магазин оружия</h2>
                  <p className="text-muted-foreground">Нажмите <kbd className="px-2 py-1 bg-secondary rounded text-sm">B</kbd> или <kbd className="px-2 py-1 bg-secondary rounded text-sm">ESC</kbd> для закрытия</p>
                </div>
                <div className="text-right">
                  <div className="text-sm text-muted-foreground">Ваши деньги</div>
                  <div className="text-3xl font-orbitron font-bold text-accent">${money}</div>
                </div>
              </div>

              {Object.entries(categoryNames).map(([category, title]) => (
                <div key={category} className="space-y-3">
                  <h3 className="text-xl font-bold text-primary border-l-4 border-primary pl-3">{title}</h3>
                  <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    {weapons.filter(w => w.category === category).map((weapon) => (
                      <Card 
                        key={weapon.id} 
                        className={`p-4 cursor-pointer transition-all hover:scale-105 border-2 ${
                          money >= weapon.price 
                            ? 'hover:border-primary hover:bg-primary/10' 
                            : 'opacity-50 cursor-not-allowed'
                        }`}
                        onClick={() => money >= weapon.price && handleBuyWeapon(weapon)}
                      >
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-lg">{weapon.name}</span>
                            <span className="text-2xl font-orbitron font-bold text-accent">${weapon.price}</span>
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {weapon.ammo}/{weapon.reserve} патронов
                          </div>
                        </div>
                      </Card>
                    ))}
                  </div>
                </div>
              ))}

              <div className="space-y-3 pt-4 border-t border-border">
                <h3 className="text-xl font-bold text-primary border-l-4 border-primary pl-3">Дополнительно</h3>
                <Card 
                  className={`p-4 cursor-pointer transition-all hover:scale-105 border-2 ${
                    money >= 100 
                      ? 'hover:border-primary hover:bg-primary/10' 
                      : 'opacity-50 cursor-not-allowed'
                  }`}
                  onClick={handleBuyAmmo}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="font-bold text-lg">Основные боеприпасы</span>
                      <div className="text-sm text-muted-foreground">+90 патронов в запас</div>
                    </div>
                    <span className="text-2xl font-orbitron font-bold text-accent">$100</span>
                  </div>
                </Card>
              </div>

              <Button 
                onClick={() => setShowShop(false)} 
                className="w-full h-12 text-lg font-semibold"
                variant="outline"
              >
                Закрыть магазин (ESC)
              </Button>
            </div>
          </Card>
        </div>
      )}

      {showConsole && (
        <div className="absolute top-0 left-0 right-0 bg-black/95 backdrop-blur-sm z-50 p-4 animate-fade-in border-b-2 border-primary max-h-[50vh] overflow-hidden flex flex-col">
          <div className="flex items-center justify-between mb-3 pb-2 border-b border-primary/30">
            <div className="flex items-center gap-2">
              <Icon name="Terminal" size={20} className="text-primary" />
              <h3 className="text-lg font-orbitron font-bold text-primary">Консоль разработчика</h3>
            </div>
            <Button size="sm" variant="ghost" onClick={() => setShowConsole(false)}>
              <Icon name="X" size={20} />
            </Button>
          </div>

          <div className="flex-1 overflow-y-auto mb-3 space-y-1 font-mono text-sm">
            {consoleHistory.map((line, i) => (
              <div key={i} className={`${line.startsWith('>') ? 'text-accent' : line.startsWith('✓') ? 'text-green-400' : line.startsWith('✗') ? 'text-red-400' : 'text-muted-foreground'}`}>
                {line}
              </div>
            ))}
          </div>

          <div className="flex items-center gap-2">
            <span className="text-primary font-orbitron font-bold">{'>'}</span>
            <input
              type="text"
              value={consoleInput}
              onChange={(e) => setConsoleInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  handleConsoleCommand(consoleInput);
                }
                if (e.key === 'Escape') {
                  setShowConsole(false);
                }
              }}
              placeholder="Введите команду (например: fps_max 250)"
              className="flex-1 bg-card border border-primary/30 rounded px-3 py-2 text-sm font-mono focus:outline-none focus:border-primary"
              autoFocus
            />
          </div>

          <div className="mt-2 text-xs text-muted-foreground">
            Подсказка: введите <span className="text-primary font-semibold">help</span> для списка команд
          </div>
        </div>
      )}

      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
          <div className="w-8 h-0.5 bg-primary/80 absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"></div>
          <div className="h-8 w-0.5 bg-primary/80 absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"></div>
          <div className="w-12 h-12 border-2 border-primary/40 rounded-full absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"></div>
        </div>
      </div>
    </div>
  );
}