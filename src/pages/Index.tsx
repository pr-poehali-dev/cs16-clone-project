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
}

const weapons: Weapon[] = [
  { id: 'glock', name: 'Glock-18', price: 0, ammo: 20, reserve: 90, category: 'pistol' },
  { id: 'usp', name: 'USP-S', price: 200, ammo: 12, reserve: 100, category: 'pistol' },
  { id: 'deagle', name: 'Desert Eagle', price: 700, ammo: 7, reserve: 35, category: 'pistol' },
  { id: 'nova', name: 'Nova', price: 1050, ammo: 8, reserve: 32, category: 'shotgun' },
  { id: 'xm1014', name: 'XM1014', price: 2000, ammo: 7, reserve: 32, category: 'shotgun' },
  { id: 'ak47', name: 'AK-47', price: 2700, ammo: 30, reserve: 90, category: 'rifle' },
  { id: 'm4a1', name: 'M4A1-S', price: 2900, ammo: 25, reserve: 75, category: 'rifle' },
  { id: 'awp', name: 'AWP', price: 4750, ammo: 10, reserve: 30, category: 'rifle' },
  { id: 'mp9', name: 'MP9', price: 1250, ammo: 30, reserve: 120, category: 'smg' },
  { id: 'm249', name: 'M249', price: 5200, ammo: 100, reserve: 200, category: 'lmg' },
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

  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (gameState === 'game' && (e.key === 'b' || e.key === 'B' || e.key === 'и' || e.key === 'И')) {
        setShowShop(!showShop);
      }
      if (showShop && e.key === 'Escape') {
        setShowShop(false);
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [gameState, showShop]);

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

          <div className="bg-card/90 backdrop-blur-sm px-4 py-2 rounded-lg border border-border">
            <div className="text-center">
              <div className="text-xs text-muted-foreground">Карта</div>
              <div className="text-lg font-semibold">De_Dust2</div>
            </div>
          </div>
        </div>

        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 text-center">
          <div className="bg-card/90 backdrop-blur-sm px-6 py-2 rounded-lg border border-primary/30 mb-2">
            <div className="text-sm text-muted-foreground">Нажмите <kbd className="px-2 py-1 bg-primary text-primary-foreground rounded font-orbitron font-bold">B</kbd> для открытия магазина</div>
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
