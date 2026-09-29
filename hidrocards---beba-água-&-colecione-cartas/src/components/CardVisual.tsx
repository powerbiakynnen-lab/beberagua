import React, { useState, useEffect } from 'react';
import { CardDefinition, CardFrameStyle } from '../types';
import { RARITY_COLORS, RARITY_LABELS, FRAME_ABBREVIATIONS } from '../data/cards';
import { Droplet, Sparkles, Lock } from 'lucide-react';

interface CardVisualProps {
  card: CardDefinition;
  customImage?: string | null;
  size?: 'sm' | 'md' | 'lg' | 'detail' | 'fullscreen';
  isFlipped?: boolean;
  isNew?: boolean;
  isLocked?: boolean;
  duplicateCount?: number;
  onClick?: () => void;
}

export const CardVisual: React.FC<CardVisualProps> = ({
  card,
  customImage,
  size = 'md',
  isFlipped = false,
  isNew = false,
  isLocked = false,
  duplicateCount = 0,
  onClick
}) => {
  const colors = RARITY_COLORS[card.rarity];
  const frameStyle: CardFrameStyle = card.frameStyle || 'classic';
  const hasSpecialFrame = frameStyle && frameStyle !== 'classic';

  const paddedId = String(card.id).padStart(3, '0');
  const formattedId = `#${paddedId}`;

  // Image source resolution:
  // 1. Project APK folder image: `/cards/001.png`
  // 2. Fallback to `/cards/001.jpg`
  // 3. User custom image (if any)
  const candidateUrls = [
    `/cards/${paddedId}.png`,
    `/cards/${paddedId}.jpg`,
    ...(customImage ? [customImage] : [])
  ];

  const [srcIndex, setSrcIndex] = useState(0);

  useEffect(() => {
    setSrcIndex(0);
  }, [card.id, customImage]);

  const currentImageUrl = candidateUrls[srcIndex];
  const hasValidCustom = currentImageUrl !== undefined;

  const handleImageError = () => {
    setSrcIndex(prev => prev + 1);
  };

  const sizeClasses = {
    sm: 'w-24 h-38 text-[10px]',
    md: 'w-32 sm:w-36 h-50 sm:h-54 text-xs',
    lg: 'w-48 h-74 text-sm',
    detail: 'w-full max-w-[280px] h-[420px] text-sm',
    fullscreen: 'w-[280px] sm:w-[330px] h-[430px] sm:h-[500px] text-sm'
  }[size];

  if (isFlipped) {
    return (
      <div
        onClick={onClick}
        className={`${sizeClasses} relative rounded-2xl border-2 border-sky-400 bg-gradient-to-br from-sky-500 via-blue-600 to-indigo-700 p-2 shadow-lg flex flex-col items-center justify-center cursor-pointer select-none transition-transform hover:scale-[1.02] active:scale-[0.98]`}
        style={{
          boxShadow: '0 8px 24px -4px rgba(14, 165, 233, 0.35)'
        }}
      >
        <div className="absolute inset-1.5 rounded-xl border border-white/30 border-dashed flex flex-col items-center justify-center text-center">
          <div className="w-10 h-10 rounded-full bg-white/20 border border-white/40 flex items-center justify-center mb-1.5 shadow-inner">
            <Droplet className="w-5 h-5 text-white fill-white/40" />
          </div>
          <span className="text-[10px] font-bold text-white uppercase tracking-widest font-display">
            HidroCards
          </span>
          <span className="text-[9px] text-sky-100 font-medium mt-0.5">Toque p/ Virar</span>
        </div>
      </div>
    );
  }

  // Rarity aura glow
  let rarityAuraStyle = {};
  if (card.rarity === 'rara') {
    rarityAuraStyle = {
      boxShadow: '0 0 14px rgba(56, 189, 248, 0.55), inset 0 0 4px rgba(56, 189, 248, 0.2)'
    };
  } else if (card.rarity === 'epica') {
    rarityAuraStyle = {
      boxShadow: '0 0 16px rgba(244, 114, 182, 0.65), inset 0 0 6px rgba(244, 114, 182, 0.2)'
    };
  } else if (card.rarity === 'lendaria') {
    rarityAuraStyle = {
      boxShadow: '0 0 20px rgba(245, 158, 11, 0.75), inset 0 0 8px rgba(245, 158, 11, 0.25)'
    };
  }

  // Distinct Frame Styles and Textures (ANIMATED on ALL special frames!)
  let frameBorderClasses = `border-2 ${colors.border}`;
  let frameBackgroundClasses = 'bg-white';
  let imageTextureOverlay: React.ReactNode = null;
  let specialBackgroundOverlay: React.ReactNode = null;

  switch (frameStyle) {
    case 'foil':
      // 1. FOIL: Holográfico Arco-Íris animado
      frameBorderClasses = 'border-[3px] border-amber-300 ring-2 ring-pink-400/50 shadow-lg';
      frameBackgroundClasses = 'bg-gradient-to-tr from-sky-50 via-rose-50 to-amber-50';
      imageTextureOverlay = (
        <div className="absolute inset-0 pointer-events-none z-20 overflow-hidden">
          <div
            className="absolute inset-0 mix-blend-color-dodge opacity-80 animate-foil-rainbow"
            style={{
              background: 'linear-gradient(115deg, transparent 5%, rgba(255,0,80,0.65) 15%, rgba(255,160,0,0.7) 25%, rgba(255,230,0,0.75) 35%, rgba(0,255,120,0.7) 45%, rgba(0,200,255,0.75) 55%, rgba(120,50,255,0.7) 68%, rgba(255,0,200,0.65) 80%, transparent 95%)',
              backgroundSize: '250% 250%'
            }}
          />
        </div>
      );
      break;

    case 'gold_texture':
      // 2. TEXTURA OURO (.OU): Ouro Nobre 24K polido, reluzente, com filete em relevo e feixe de luz metálico animado
      frameBorderClasses = 'border-[3.5px] border-amber-300 ring-2 ring-yellow-500/80 shadow-[0_0_20px_rgba(245,158,11,0.55)] animate-gold-aura';
      frameBackgroundClasses = 'bg-gradient-to-b from-amber-200 via-amber-50 to-amber-200 text-amber-950';
      imageTextureOverlay = (
        <div className="absolute inset-0 pointer-events-none z-20 overflow-hidden">
          {/* Brilho metálico especular dourado suave */}
          <div
            className="absolute inset-0 opacity-40 mix-blend-soft-light"
            style={{
              background: 'linear-gradient(135deg, rgba(255,255,255,0.8) 0%, transparent 35%, rgba(254,240,138,0.5) 55%, transparent 70%, rgba(255,255,255,0.8) 100%)'
            }}
          />
          {/* Filete interno em alto relevo dourado acetinado */}
          <div className="absolute inset-1 rounded-lg border border-amber-500/70 shadow-inner" />
          {/* Rebites dourados reluzentes nos cantos */}
          <div className="absolute top-1 left-1 w-2 h-2 rounded-full bg-gradient-to-br from-white via-amber-300 to-amber-600 shadow-xs" />
          <div className="absolute top-1 right-1 w-2 h-2 rounded-full bg-gradient-to-bl from-white via-amber-300 to-amber-600 shadow-xs" />
          <div className="absolute bottom-1 left-1 w-2 h-2 rounded-full bg-gradient-to-tr from-white via-amber-300 to-amber-600 shadow-xs" />
          <div className="absolute bottom-1 right-1 w-2 h-2 rounded-full bg-gradient-to-tl from-white via-amber-300 to-amber-600 shadow-xs" />
          
          {/* Feixe animado de brilho metálico que cruza a carta */}
          <div
            className="absolute inset-0 w-[200%] h-full pointer-events-none animate-gold-sweep"
            style={{
              background: 'linear-gradient(105deg, transparent 30%, rgba(255,255,255,0.65) 45%, rgba(254,240,138,0.85) 50%, rgba(255,255,255,0.65) 55%, transparent 70%)'
            }}
          />
        </div>
      );
      break;

    case 'cosmic':
      // 3. CÓSMICA (.CM): Efeito sombrio profundo, névoa abissal e estrelas piscando
      frameBorderClasses = 'border-[3px] border-purple-600 ring-2 ring-indigo-500/70 shadow-[0_0_22px_rgba(147,51,234,0.6)]';
      frameBackgroundClasses = 'bg-slate-950 text-white';
      specialBackgroundOverlay = (
        <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
          {/* Vinheta escura profunda pulsante */}
          <div
            className="absolute inset-0 animate-sombrio-shadow"
            style={{
              background: 'radial-gradient(circle at center, transparent 15%, rgba(2, 6, 23, 0.95) 90%)',
              boxShadow: 'inset 0 0 40px rgba(0, 0, 0, 0.98)'
            }}
          />
          {/* Fumaça sombria de nebulosa */}
          <div
            className="absolute inset-0 animate-smoky-tendril opacity-45"
            style={{
              backgroundImage: 'radial-gradient(ellipse at top left, #6b21a8 0%, transparent 60%), radial-gradient(ellipse at bottom right, #1e1b4b 0%, transparent 70%)',
              backgroundSize: '200% 200%'
            }}
          />
          {/* Estrelas estelares cintilantes */}
          <div className="absolute inset-0 animate-cosmic-twinkle pointer-events-none opacity-60">
            <div className="absolute top-2 left-3 w-1 h-1 rounded-full bg-cyan-200 shadow-[0_0_4px_#38bdf8]" />
            <div className="absolute top-6 right-4 w-1.5 h-1.5 rounded-full bg-purple-200 shadow-[0_0_6px_#c084fc]" />
            <div className="absolute bottom-4 left-5 w-1 h-1 rounded-full bg-white shadow-[0_0_4px_#ffffff]" />
            <div className="absolute bottom-8 right-3 w-1.5 h-1.5 rounded-full bg-pink-200 shadow-[0_0_5px_#f472b6]" />
          </div>
        </div>
      );
      break;

    case 'crystal':
      // 4. CRISTAL (.CR): Prisma de gelo translúcido lapidado com feixe de luz refratada animado
      frameBorderClasses = 'border-[3px] border-cyan-300 ring-2 ring-sky-300/80 shadow-[0_0_18px_rgba(56,189,248,0.55)]';
      frameBackgroundClasses = 'bg-gradient-to-b from-cyan-100 via-white to-sky-100 text-cyan-950';
      imageTextureOverlay = (
        <div className="absolute inset-0 pointer-events-none z-20 overflow-hidden">
          {/* Padrão geométrico de prismas de gelo lapidado com pulso */}
          <div
            className="absolute inset-0 opacity-30 mix-blend-color-burn animate-crystal-facets"
            style={{
              backgroundImage: `
                linear-gradient(30deg, #0284c7 12%, transparent 12.5%, transparent 87%, #0284c7 87.5%, #0284c7),
                linear-gradient(150deg, #0284c7 12%, transparent 12.5%, transparent 87%, #0284c7 87.5%, #0284c7),
                linear-gradient(60deg, rgba(14, 165, 233, 0.5) 25%, transparent 25.5%, transparent 75%, rgba(14, 165, 233, 0.5) 75%, rgba(14, 165, 233, 0.5))
              `,
              backgroundSize: '20px 35px'
            }}
          />
          {/* Feixe de luz prismático que corta os cristais */}
          <div
            className="absolute inset-0 w-full h-[250%] pointer-events-none animate-crystal-gleam"
            style={{
              background: 'linear-gradient(180deg, transparent 40%, rgba(255,255,255,0.7) 48%, rgba(186,230,253,0.85) 50%, rgba(255,255,255,0.7) 52%, transparent 60%)'
            }}
          />
        </div>
      );
      break;

    case 'pokemon':
      // 5. POKÉMON VINTAGE (.VT): Moldura amarela clássica retrô anos 90 com estrelas holográficas vintage animadas
      frameBorderClasses = 'border-[5px] border-amber-400 ring-2 ring-amber-600/70 shadow-lg';
      frameBackgroundClasses = 'bg-[#fefce8] text-amber-950';
      imageTextureOverlay = (
        <div className="absolute inset-0 pointer-events-none z-20 overflow-hidden border border-amber-600/50 shadow-inner">
          <div
            className="absolute inset-0 opacity-45 mix-blend-color-dodge animate-vintage-sparkle"
            style={{
              backgroundImage: 'radial-gradient(circle at 10% 20%, rgba(251,191,36,0.8) 2px, transparent 3px), radial-gradient(circle at 60% 70%, rgba(255,255,255,0.9) 2px, transparent 3px), radial-gradient(circle at 85% 30%, rgba(245,158,11,0.8) 2px, transparent 3px), radial-gradient(circle at 35% 85%, rgba(251,191,36,0.9) 2px, transparent 3px)',
              backgroundSize: '40px 40px'
            }}
          />
        </div>
      );
      break;

    default:
      // 6. CLÁSSICA (Sem moldura)
      frameBorderClasses = `border-2 ${colors.border}`;
      frameBackgroundClasses = 'bg-white text-slate-900';
      imageTextureOverlay = null;
      specialBackgroundOverlay = null;
      break;
  }

  const isDarkFrame = frameStyle === 'cosmic';

  return (
    <div
      onClick={onClick}
      className={`${sizeClasses} relative rounded-2xl ${frameBorderClasses} ${frameBackgroundClasses} p-2 flex flex-col justify-between select-none transition-all duration-200 overflow-hidden ${
        onClick ? 'cursor-pointer hover:-translate-y-1 hover:scale-[1.01] active:scale-[0.98]' : ''
      }`}
      style={rarityAuraStyle}
    >
      {/* Overlay especial de fundo (se houver, e.g. cósmica) */}
      {specialBackgroundOverlay}

      {/* 1. NO TOPO: inicio esquerdo #001 e inicio canto direito COMUM (ou COMUM.CM etc.) */}
      <div className="flex items-center justify-between z-10 px-1 pt-0.5 pb-0.5 w-full">
        <span className={`font-mono font-extrabold text-[10px] sm:text-[11px] ${isDarkFrame ? 'text-purple-300' : 'text-slate-500'}`}>
          {formattedId}
        </span>
        <span className={`font-mono font-extrabold text-[9px] sm:text-[10px] uppercase tracking-wider text-right ${
          card.rarity === 'lendaria' ? 'text-amber-500' :
          card.rarity === 'epica' ? 'text-pink-500' :
          card.rarity === 'rara' ? 'text-sky-500' :
          isDarkFrame ? 'text-slate-300' : 'text-slate-500'
        }`}>
          {RARITY_LABELS[card.rarity].toUpperCase()}{hasSpecialFrame && FRAME_ABBREVIATIONS[frameStyle] ? `.${FRAME_ABBREVIATIONS[frameStyle]}` : ''}
        </span>
      </div>

      {/* 2. ABAIXO O NOME DA CARTA (quando bloqueada: "???") */}
      <div className="z-10 px-1 pb-1 w-full text-center">
        <h4
          className={`font-bold text-[11px] sm:text-xs truncate font-display tracking-tight ${
            isLocked
              ? 'text-slate-400 font-mono tracking-widest'
              : isDarkFrame
              ? 'text-white'
              : 'text-slate-900'
          }`}
          title={isLocked ? 'Carta Bloqueada' : card.name}
        >
          {isLocked ? '???' : card.name}
        </h4>
      </div>

      {/* 3. ABAIXO A IMAGEM (quando bloqueada: sem revelar imagem) */}
      <div
        className={`relative flex-1 w-full rounded-xl overflow-hidden border ${
          isDarkFrame
            ? 'border-purple-900/80 bg-black'
            : frameStyle === 'pokemon'
            ? 'border-amber-400/90 bg-amber-50/50'
            : frameStyle === 'gold_texture'
            ? 'border-amber-400/80 bg-amber-100/60'
            : frameStyle === 'crystal'
            ? 'border-cyan-300 bg-sky-50'
            : 'border-slate-200/80 bg-gradient-to-b from-slate-100 to-sky-50'
        } flex items-center justify-center shadow-inner z-10`}
      >
        {/* Overlay de textura/moldura animado */}
        {imageTextureOverlay}

        {isLocked ? (
          /* Visual de carta bloqueada: sem revelar a imagem, com cadeado */
          <div className="w-full h-full relative flex flex-col items-center justify-center p-2 text-center bg-slate-900/70 backdrop-blur-xs">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-2xl bg-slate-800/90 border border-slate-700 flex items-center justify-center text-slate-400 shadow-inner mb-1">
              <Lock className="w-4 h-4 sm:w-5 sm:h-5 text-slate-400" />
            </div>
            <span className="text-[9px] font-mono text-slate-400 uppercase font-bold tracking-wider">
              Bloqueada
            </span>
          </div>
        ) : hasValidCustom ? (
          <img
            src={currentImageUrl}
            alt={card.name}
            onError={handleImageError}
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover object-center"
          />
        ) : (
          /* Placeholder de arte estilizada padrão caso a imagem ainda não exista em public/cards/ */
          <div className="w-full h-full relative flex flex-col items-center justify-center p-2 text-center overflow-hidden">
            <div
              className={`w-12 h-12 sm:w-14 sm:h-14 rounded-2xl border-2 ${colors.border} ${colors.bg} flex items-center justify-center mb-1 shadow-sm transition-transform group-hover:scale-105`}
            >
              {card.rarity === 'lendaria' ? (
                <Sparkles className="w-6 h-6 text-amber-500 animate-spin" style={{ animationDuration: '8s' }} />
              ) : card.rarity === 'epica' ? (
                <Sparkles className="w-6 h-6 text-pink-500 animate-pulse" />
              ) : card.rarity === 'rara' ? (
                <Droplet className="w-6 h-6 text-sky-500 fill-sky-500/20 animate-pulse" />
              ) : (
                <Droplet className="w-5 h-5 text-slate-400" />
              )}
            </div>

            <div className={`text-[9px] font-mono tracking-wide ${isDarkFrame ? 'text-slate-400' : 'text-slate-500'}`}>
              {formattedId}.png
            </div>
          </div>
        )}

        {/* Shiny corner badge if New */}
        {!isLocked && isNew && (
          <div className="absolute top-1.5 left-1.5 px-1.5 py-0.5 rounded bg-emerald-500 text-white font-bold text-[9px] uppercase tracking-wide shadow-sm z-30">
            Nova!
          </div>
        )}

        {/* Duplicate Count Badge - REPETIDO */}
        {!isLocked && duplicateCount > 1 && (
          <div className="absolute bottom-1.5 right-1.5 px-1.5 py-0.5 rounded-md bg-amber-500 text-white font-sans font-extrabold text-[8px] uppercase tracking-wide shadow-md z-30 flex items-center gap-1 border border-amber-300">
            <span>REPETIDO</span>
            <span className="font-mono text-[8.5px] bg-amber-700/60 px-1 rounded">{duplicateCount}</span>
          </div>
        )}
      </div>

      {/* 4. ABAIXO A DESCRIÇÃO (quando bloqueada: "Bloqueada") */}
      <div className="z-10 pt-1.5 px-1">
        <p
          className={`text-[9px] sm:text-[10px] leading-tight line-clamp-2 italic font-sans text-center ${
            isLocked
              ? 'text-slate-400'
              : isDarkFrame
              ? 'text-slate-300'
              : 'text-slate-600'
          }`}
          title={isLocked ? 'Bloqueada' : card.description}
        >
          {isLocked ? 'Bloqueada' : `"${card.description}"`}
        </p>
      </div>
    </div>
  );
};
