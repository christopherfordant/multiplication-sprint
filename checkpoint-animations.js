/**
 * 🎬 Module d'amélioration des animations Checkpoint → Carte
 * Ajoute des transitions fluides et des notifications visuelles
 */

// 🔄 Amélioration de la fonction returnToMapFromCheckpoint
const originalReturnToMapFromCheckpoint = (typeof returnToMapFromCheckpoint !== 'undefined') ? returnToMapFromCheckpoint : null;

function enhancedReturnToMapFromCheckpoint() {
  // Ajouter la classe d'animation au checkpoint
  const checkpointCard = document.getElementById('checkpointScreen');
  if (checkpointCard && window.gsap) {
    // Animation de départ du checkpoint
    gsap.to(checkpointCard, {
      opacity: 0,
      y: -100,
      scale: 0.85,
      duration: 0.6,
      ease: "power2.in",
      onComplete: () => {
        // Appeler la fonction originale
        if (originalReturnToMapFromCheckpoint) {
          originalReturnToMapFromCheckpoint();
        }
        
        // Animer l'arrivée sur la carte
        const mapScreen = document.getElementById('mapScreen');
        if (mapScreen) {
          gsap.fromTo(mapScreen, 
            { opacity: 0, y: 100, scale: 0.85 },
            { opacity: 1, y: 0, scale: 1, duration: 0.6, ease: "back.out" }
          );
          
          // Animer les nœuds de la carte
          const mapNodes = document.querySelectorAll('.map-node');
          gsap.fromTo(mapNodes,
            { opacity: 0, scale: 0.8 },
            { 
              opacity: 1, 
              scale: 1, 
              duration: 0.4,
              stagger: 0.05,
              ease: "back.out"
            }
          );
          
          // Animer la mascotte
          const mascot = document.getElementById('mapMascot');
          if (mascot) {
            gsap.fromTo(mascot,
              { opacity: 0, scale: 0 },
              { 
                opacity: 1, 
                scale: 1, 
                duration: 0.5,
                delay: 0.3,
                ease: "elastic.out"
              }
            );
          }
        }
      }
    });
  } else {
    if (originalReturnToMapFromCheckpoint) {
      originalReturnToMapFromCheckpoint();
    }
  }
}

// Remplacer la fonction
if (typeof window !== 'undefined' && originalReturnToMapFromCheckpoint) {
  window.returnToMapFromCheckpoint = enhancedReturnToMapFromCheckpoint;
}

// 🔄 Amélioration de showCheckpoint pour les animations
const originalShowCheckpoint = (typeof showCheckpoint !== 'undefined') ? showCheckpoint : null;

function enhancedShowCheckpointAnimations() {
  // Appeler la fonction originale
  if (originalShowCheckpoint) {
    originalShowCheckpoint();
  }
  
  if (!window.gsap) return;
  
  // Animer l'apparition du checkpoint
  const checkpointCard = document.querySelector('.checkpoint-card');
  if (checkpointCard) {
    // Réinitialiser les styles
    gsap.set(checkpointCard, { opacity: 0, scale: 0.92, y: 20 });
    
    // Animer l'apparition
    gsap.to(checkpointCard, {
      opacity: 1,
      scale: 1,
      y: 0,
      duration: 0.5,
      ease: "back.out"
    });
    
    // Animer les éléments individuels
    const eyebrow = document.getElementById('checkpointEyebrow');
    const title = document.getElementById('checkpointTitle');
    const message = document.getElementById('checkpointMessage');
    const stars = document.querySelectorAll('#checkpointStars .star-item');
    const results = document.querySelectorAll('.result-item');
    
    if (eyebrow) {
      gsap.fromTo(eyebrow,
        { opacity: 0, y: -10 },
        { opacity: 1, y: 0, duration: 0.3, delay: 0.1 }
      );
    }
    
    if (title) {
      gsap.fromTo(title,
        { opacity: 0, y: -10 },
        { opacity: 1, y: 0, duration: 0.3, delay: 0.2 }
      );
    }
    
    if (message) {
      gsap.fromTo(message,
        { opacity: 0, y: 10 },
        { opacity: 1, y: 0, duration: 0.3, delay: 0.3 }
      );
    }
    
    // Animer les étoiles avec un effet pop
    stars.forEach((star, index) => {
      gsap.fromTo(star,
        { scale: 0, rotate: -180, opacity: 0 },
        {
          scale: 1,
          rotate: 0,
          opacity: 1,
          duration: 0.5,
          delay: 0.4 + (index * 0.15),
          ease: "elastic.out(1.2, 0.5)"
        }
      );
    });
    
    // Animer les résultats
    results.forEach((result, index) => {
      gsap.fromTo(result,
        { opacity: 0, y: 10, x: -20 },
        {
          opacity: 1,
          y: 0,
          x: 0,
          duration: 0.4,
          delay: 0.5 + (index * 0.1),
          ease: "back.out"
        }
      );
    });
  }
}

// Remplacer la fonction showCheckpoint
if (typeof window !== 'undefined' && originalShowCheckpoint) {
  window.showCheckpoint = enhancedShowCheckpointAnimations;
}

// 🎯 Amélioration de selectMapLevel pour animer l'arrivée
const originalSelectMapLevel = (typeof selectMapLevel !== 'undefined') ? selectMapLevel : null;

function enhancedSelectMapLevel(level, instant = false) {
  if (originalSelectMapLevel) {
    originalSelectMapLevel(level, instant);
  }
  
  if (window.gsap && !instant) {
    // Animer le changement de sélection
    const selectedNode = document.querySelector('.map-node.selected');
    if (selectedNode) {
      gsap.fromTo(selectedNode,
        { scale: 0.9 },
        { 
          scale: 1, 
          duration: 0.3,
          ease: "elastic.out"
        }
      );
    }
    
    // Animer la description
    const description = document.getElementById('selectedLevelDescription');
    if (description) {
      gsap.fromTo(description,
        { opacity: 0, y: -10 },
        { 
          opacity: 1, 
          y: 0, 
          duration: 0.3,
          ease: "back.out"
        }
      );
    }
  }
}

// Remplacer la fonction
if (typeof window !== 'undefined' && originalSelectMapLevel) {
  window.selectMapLevel = enhancedSelectMapLevel;
}

// 🌟 Notification de niveau débloqué
function showLevelUnlockedNotification(levelNumber) {
  if (!window.gsap) return;
  
  const mapNodes = document.querySelectorAll('.map-node');
  const node = Array.from(mapNodes).find(n => {
    const text = n.textContent.trim();
    return text.includes(String(levelNumber)) || text === String(levelNumber);
  });
  
  if (node) {
    // Ajouter la classe d'animation
    node.classList.add('newly-unlocked');
    
    // Créer une notification
    const notification = document.createElement('div');
    notification.style.cssText = `
      position: fixed;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      background: linear-gradient(135deg, #21c06b, #ffd54a);
      color: white;
      padding: 20px 40px;
      border-radius: 16px;
      font-weight: bold;
      font-size: 18px;
      box-shadow: 0 10px 40px rgba(33, 192, 107, 0.3);
      z-index: 1000;
      pointer-events: none;
    `;
    notification.textContent = `🎉 Niveau ${levelNumber} débloqué!`;
    document.body.appendChild(notification);
    
    // Animer la notification
    gsap.timeline()
      .fromTo(notification,
        { opacity: 0, scale: 0.5, y: -20 },
        { 
          opacity: 1, 
          scale: 1, 
          y: 0,
          duration: 0.4,
          ease: "back.out"
        }
      )
      .to(notification,
        { opacity: 0, scale: 0.5, y: 20, duration: 0.4, ease: "back.in" },
        "+=1.5"
      )
      .call(() => notification.remove());
  }
}

// 📊 Amélioration de updateProgressAfterWin
const originalUpdateProgressAfterWin = (typeof updateProgressAfterWin !== 'undefined') ? updateProgressAfterWin : null;

function enhancedUpdateProgressAfterWin() {
  if (originalUpdateProgressAfterWin) {
    originalUpdateProgressAfterWin();
  }
  
  // Montrer la notification de déblocage
  if (state && state.highestUnlockedLevel <= TOTAL_LEVELS) {
    const nextLevel = Math.min(state.highestUnlockedLevel, TOTAL_LEVELS);
    window.setTimeout(() => {
      showLevelUnlockedNotification(nextLevel);
    }, 800);
  }
}

// Remplacer la fonction
if (typeof window !== 'undefined' && originalUpdateProgressAfterWin) {
  window.updateProgressAfterWin = enhancedUpdateProgressAfterWin;
}

console.log('✅ Module animations améliorées chargé');
