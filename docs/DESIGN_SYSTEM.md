# 🎨 Ignitee 디자인 시스템

## 📋 목차
1. [비주얼 디렉션](#1-비주얼-디렉션)
2. [컬러 팔레트](#2-컬러-팔레트)
3. [타이포그래피](#3-타이포그래피)
4. [비주얼 모티프](#4-비주얼-모티프)
5. [애니메이션 가이드](#5-애니메이션-가이드)
6. [컴포넌트 가이드](#6-컴포넌트-가이드)
7. [Figma 가이드](#7-figma-가이드)

## 1. 비주얼 디렉션

### 1.1 핵심 컨셉
**"Ignite Your Launch"** - 불꽃이 켜지는 순간의 에너지와 열정을 표현

### 1.2 디자인 철학
- **다크 테마**: 전문적이고 집중된 환경
- **그라데이션 불꽃**: 에너지와 역동성 표현
- **테크 감성**: 개발자 친화적인 인터페이스
- **미니멀리즘**: 핵심 기능에 집중

## 2. 컬러 팔레트

### 2.1 메인 컬러
```css
/* 배경 */
--bg-primary: #0D0D0D;        /* 딥 블랙 */
--bg-secondary: #1A1A1A;     /* 다크 그레이 */
--bg-tertiary: #262626;       /* 미드 그레이 */

/* 그라데이션 불꽃 */
--gradient-orange: #FF6B35;   /* 오렌지 */
--gradient-red: #F71735;      /* 레드 */
--gradient-magenta: #C44569;  /* 마젠타 */

/* 그라데이션 조합 */
--gradient-ignite: linear-gradient(135deg, #FF6B35 0%, #F71735 50%, #C44569 100%);
```

### 2.2 보조 컬러
```css
/* 텍스트 */
--text-primary: #FFFFFF;     /* 화이트 */
--text-secondary: #B3B3B3;    /* 라이트 그레이 */
--text-muted: #666666;        /* 미드 그레이 */

/* 액센트 */
--accent-blue: #4A90E2;       /* 블루 */
--accent-green: #7ED321;       /* 그린 */
--accent-yellow: #F5A623;      /* 옐로우 */

/* 상태 */
--success: #7ED321;           /* 성공 */
--warning: #F5A623;           /* 경고 */
--error: #F71735;             /* 에러 */
--info: #4A90E2;              /* 정보 */
```

### 2.3 그라데이션 변형
```css
/* 메인 그라데이션 */
.gradient-ignite {
  background: linear-gradient(135deg, #FF6B35 0%, #F71735 50%, #C44569 100%);
}

/* 수직 그라데이션 */
.gradient-ignite-vertical {
  background: linear-gradient(180deg, #FF6B35 0%, #F71735 50%, #C44569 100%);
}

/* 방사형 그라데이션 */
.gradient-ignite-radial {
  background: radial-gradient(circle, #FF6B35 0%, #F71735 50%, #C44569 100%);
}

/* 호버 효과 */
.gradient-ignite-hover {
  background: linear-gradient(135deg, #FF8C42 0%, #FF4757 50%, #E84393 100%);
}
```

## 3. 타이포그래피

### 3.1 폰트 패밀리
```css
/* 메인 폰트 */
--font-primary: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;

/* 코드 폰트 */
--font-mono: 'JetBrains Mono', 'Fira Code', 'Consolas', monospace;

/* 폰트 웨이트 */
--font-light: 300;
--font-regular: 400;
--font-medium: 500;
--font-semibold: 600;
--font-bold: 700;
--font-extrabold: 800;
```

### 3.2 타이포그래피 스케일
```css
/* 헤딩 */
.text-h1 { font-size: 3rem; font-weight: 700; line-height: 1.2; }
.text-h2 { font-size: 2.5rem; font-weight: 600; line-height: 1.3; }
.text-h3 { font-size: 2rem; font-weight: 600; line-height: 1.4; }
.text-h4 { font-size: 1.5rem; font-weight: 500; line-height: 1.4; }
.text-h5 { font-size: 1.25rem; font-weight: 500; line-height: 1.5; }
.text-h6 { font-size: 1.125rem; font-weight: 500; line-height: 1.5; }

/* 본문 */
.text-body-large { font-size: 1.125rem; font-weight: 400; line-height: 1.6; }
.text-body { font-size: 1rem; font-weight: 400; line-height: 1.6; }
.text-body-small { font-size: 0.875rem; font-weight: 400; line-height: 1.5; }

/* 코드 */
.text-code { font-family: var(--font-mono); font-size: 0.875rem; }
.text-code-large { font-family: var(--font-mono); font-size: 1rem; }
```

## 4. 비주얼 모티프

### 4.1 불꽃 모티프
```css
/* 불꽃 아이콘 */
.ignite-icon {
  background: var(--gradient-ignite);
  border-radius: 50%;
  width: 24px;
  height: 24px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

/* 불꽃 버튼 */
.btn-ignite {
  background: var(--gradient-ignite);
  color: white;
  border: none;
  padding: 12px 24px;
  border-radius: 8px;
  font-weight: 600;
  transition: all 0.3s ease;
}

.btn-ignite:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(255, 107, 53, 0.3);
}
```

### 4.2 데이터 노드 모티프
```css
/* 데이터 노드 */
.data-node {
  background: var(--bg-secondary);
  border: 2px solid var(--gradient-ignite);
  border-radius: 12px;
  padding: 16px;
  position: relative;
  overflow: hidden;
}

.data-node::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 2px;
  background: var(--gradient-ignite);
}

/* 연결선 */
.connection-line {
  stroke: var(--gradient-ignite);
  stroke-width: 2;
  stroke-dasharray: 5, 5;
  animation: dash 1s linear infinite;
}

@keyframes dash {
  to { stroke-dashoffset: -10; }
}
```

## 5. 애니메이션 가이드

### 5.1 불꽃 켜지는 모션
```css
/* 불꽃 애니메이션 */
@keyframes ignite {
  0% { 
    opacity: 0;
    transform: scale(0.8);
  }
  50% { 
    opacity: 1;
    transform: scale(1.1);
  }
  100% { 
    opacity: 1;
    transform: scale(1);
  }
}

.ignite-animation {
  animation: ignite 0.6s ease-out;
}
```

### 5.2 데이터 노드 연결 애니메이션
```css
/* 노드 연결 애니메이션 */
@keyframes connect {
  0% { 
    opacity: 0;
    transform: translateY(20px);
  }
  100% { 
    opacity: 1;
    transform: translateY(0);
  }
}

.connect-animation {
  animation: connect 0.8s ease-out;
}

/* 순차적 연결 */
.connect-animation:nth-child(1) { animation-delay: 0s; }
.connect-animation:nth-child(2) { animation-delay: 0.2s; }
.connect-animation:nth-child(3) { animation-delay: 0.4s; }
.connect-animation:nth-child(4) { animation-delay: 0.6s; }
```

### 5.3 호버 효과
```css
/* 버튼 호버 */
.btn-hover {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.btn-hover:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(255, 107, 53, 0.3);
}

/* 카드 호버 */
.card-hover {
  transition: all 0.3s ease;
}

.card-hover:hover {
  transform: translateY(-4px);
  box-shadow: 0 12px 40px rgba(0, 0, 0, 0.3);
}
```

## 6. 컴포넌트 가이드

### 6.1 메인 CTA 버튼
```css
.btn-primary {
  background: var(--gradient-ignite);
  color: white;
  border: none;
  padding: 16px 32px;
  border-radius: 12px;
  font-size: 1.125rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
}

.btn-primary::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
  transition: left 0.5s;
}

.btn-primary:hover::before {
  left: 100%;
}
```

### 6.2 입력 필드
```css
.input-field {
  background: var(--bg-secondary);
  border: 2px solid transparent;
  border-radius: 8px;
  padding: 12px 16px;
  color: var(--text-primary);
  font-size: 1rem;
  transition: all 0.3s ease;
}

.input-field:focus {
  border-color: var(--gradient-ignite);
  outline: none;
  box-shadow: 0 0 0 3px rgba(255, 107, 53, 0.1);
}
```

### 6.3 카드 컴포넌트
```css
.card {
  background: var(--bg-secondary);
  border-radius: 16px;
  padding: 24px;
  border: 1px solid rgba(255, 107, 53, 0.1);
  transition: all 0.3s ease;
}

.card:hover {
  border-color: var(--gradient-ignite);
  box-shadow: 0 8px 25px rgba(255, 107, 53, 0.1);
}
```

## 7. Figma 가이드

### 7.1 컬러 스타일
```
Primary Colors:
- Ignite Orange: #FF6B35
- Ignite Red: #F71735  
- Ignite Magenta: #C44569
- Deep Black: #0D0D0D

Secondary Colors:
- Dark Gray: #1A1A1A
- Mid Gray: #262626
- Light Gray: #B3B3B3
- White: #FFFFFF
```

### 7.2 타이포그래피 스타일
```
Headings:
- H1: Inter Bold, 48px
- H2: Inter Semibold, 40px
- H3: Inter Semibold, 32px
- H4: Inter Medium, 24px

Body Text:
- Large: Inter Regular, 18px
- Regular: Inter Regular, 16px
- Small: Inter Regular, 14px

Code:
- Regular: JetBrains Mono Regular, 14px
- Large: JetBrains Mono Regular, 16px
```

### 7.3 컴포넌트 스타일
```
Buttons:
- Primary: Gradient background, 16px padding, 12px border radius
- Secondary: Transparent background, gradient border
- Small: 12px padding, 8px border radius

Cards:
- Default: 16px border radius, 24px padding
- Hover: Gradient border, shadow effect

Inputs:
- Default: 8px border radius, 12px padding
- Focus: Gradient border, glow effect
```

### 7.4 애니메이션 프리셋
```
Ignite Animation:
- Duration: 600ms
- Easing: ease-out
- Scale: 0.8 → 1.1 → 1.0
- Opacity: 0 → 1

Connect Animation:
- Duration: 800ms
- Easing: ease-out
- Transform: translateY(20px) → translateY(0)
- Stagger: 200ms delay between elements
```

## 8. 첫 사용자 액션

### 8.1 "Ignite My Launch" 버튼
```css
.btn-ignite-launch {
  background: var(--gradient-ignite);
  color: white;
  border: none;
  padding: 20px 40px;
  border-radius: 16px;
  font-size: 1.25rem;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.btn-ignite-launch:hover {
  transform: translateY(-3px);
  box-shadow: 0 12px 40px rgba(255, 107, 53, 0.4);
}

.btn-ignite-launch:active {
  transform: translateY(-1px);
}
```

### 8.2 버튼 텍스트 변형
```css
.btn-ignite-launch::after {
  content: ' 🔥';
  margin-left: 8px;
  animation: flicker 2s infinite;
}

@keyframes flicker {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.7; }
}
```

## 9. 반응형 디자인

### 9.1 브레이크포인트
```css
/* 모바일 */
@media (max-width: 768px) {
  .text-h1 { font-size: 2rem; }
  .btn-ignite-launch { padding: 16px 32px; font-size: 1.125rem; }
}

/* 태블릿 */
@media (min-width: 769px) and (max-width: 1024px) {
  .text-h1 { font-size: 2.5rem; }
}

/* 데스크톱 */
@media (min-width: 1025px) {
  .text-h1 { font-size: 3rem; }
}
```

### 9.2 모바일 최적화
```css
/* 모바일 터치 타겟 */
.btn-mobile {
  min-height: 44px;
  min-width: 44px;
}

/* 모바일 그라데이션 조정 */
@media (max-width: 768px) {
  .gradient-ignite {
    background: linear-gradient(180deg, #FF6B35 0%, #F71735 50%, #C44569 100%);
  }
}
```

## 10. 접근성 고려사항

### 10.1 컬러 대비
```css
/* WCAG AA 준수 */
.text-primary { color: #FFFFFF; } /* 대비비 21:1 */
.text-secondary { color: #B3B3B3; } /* 대비비 4.5:1 */
.text-muted { color: #666666; } /* 대비비 3:1 */
```

### 10.2 포커스 표시
```css
.focus-visible {
  outline: 2px solid var(--gradient-ignite);
  outline-offset: 2px;
}
```

---

**디자인 시스템 버전**: v1.0  
**최종 업데이트**: 2024-01-15  
**관리자**: Ignitee Design Team

> 💡 **기억하세요**: 모든 디자인 요소는 "Ignite Your Launch"라는 핵심 메시지와 일치해야 합니다. 불꽃의 에너지와 열정을 시각적으로 표현하는 것이 목표입니다.
