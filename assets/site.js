(() => {
  const canvas = document.getElementById('cube');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  if (!ctx) return;
  const button = document.getElementById('motion');
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)');
  let paused = reduce.matches, angle = .55, previous = 0;
  const vertices = [[-1,-1,-1],[1,-1,-1],[1,1,-1],[-1,1,-1],[-1,-1,1],[1,-1,1],[1,1,1],[-1,1,1]];
  const edges = [[0,1],[1,2],[2,3],[3,0],[4,5],[5,6],[6,7],[7,4],[0,4],[1,5],[2,6],[3,7]];
  function updateButton() { button.textContent = paused ? 'Resume rotation' : 'Pause rotation'; button.setAttribute('aria-pressed',String(paused)); }
  function draw() {
    const w = canvas.clientWidth, h = canvas.clientHeight, dpr = Math.min(window.devicePixelRatio || 1,2);
    if(canvas.width !== Math.round(w*dpr) || canvas.height !== Math.round(h*dpr)){canvas.width=Math.round(w*dpr);canvas.height=Math.round(h*dpr);}
    ctx.setTransform(dpr,0,0,dpr,0,0);ctx.clearRect(0,0,w,h);
    ctx.strokeStyle='#273139';ctx.lineWidth=1;
    for(let x=16;x<w;x+=25){ctx.beginPath();ctx.moveTo(x,10);ctx.lineTo(x,h-10);ctx.stroke();}
    for(let y=15;y<h;y+=25){ctx.beginPath();ctx.moveTo(0,y);ctx.lineTo(w,y);ctx.stroke();}
    const c=Math.cos(angle),s=Math.sin(angle),tilt=.35;
    const points=vertices.map(([x,y,z])=>{let X=x*c+z*s,Z=-x*s+z*c,Y=y*Math.cos(tilt)-Z*Math.sin(tilt);Z=y*Math.sin(tilt)+Z*Math.cos(tilt)+5;let scale=Math.min(w,h)*1.05;return [w/2+scale*X/Z,h/2-scale*Y/Z];});
    ctx.strokeStyle='#cdf86f';ctx.lineWidth=1.7;
    edges.forEach(([a,b])=>{ctx.beginPath();ctx.moveTo(...points[a]);ctx.lineTo(...points[b]);ctx.stroke();});
    points.forEach(([x,y],i)=>{ctx.fillStyle='#edf1ee';ctx.beginPath();ctx.arc(x,y,3,0,Math.PI*2);ctx.fill();ctx.font='11px monospace';ctx.fillStyle='#a7b1b6';ctx.fillText(String(i),x+9,y-7);});
  }
  function frame(time){if(!paused) angle+=Math.min((time-previous)/1000,.05)*.24;previous=time;draw();requestAnimationFrame(frame);}
  button.addEventListener('click',()=>{paused=!paused;updateButton();});
  reduce.addEventListener('change',e=>{paused=e.matches;updateButton();});
  updateButton();requestAnimationFrame(frame);
})();
