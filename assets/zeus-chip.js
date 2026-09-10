import * as THREE from './three.module.min.js';

// A modeled, double-sided pita chip: irregular edges, curled dough, baked blisters,
// and a softly textured baked surface. No external model requests.
export function mountChip(stage) {
  let renderer;
  try { renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true, powerPreference: 'low-power' }); }
  catch { stage.classList.add('chip-unavailable'); return; }
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  renderer.setClearColor(0x000000, 0);
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.25;
  renderer.domElement.setAttribute('aria-hidden', 'true');
  stage.appendChild(renderer.domElement);
  stage.classList.add('chip-ready');
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(35, 1, .1, 30);
  // Leave room for the chip's full diagonal, bounce, and hover scale at every angle.
  camera.position.set(0, 0, 6.8);
  camera.lookAt(0, .12, 0);
  scene.add(new THREE.HemisphereLight(0xfff5df, 0x9b6231, 2.5));
  const sun = new THREE.DirectionalLight(0xffedce, 3.8);
  sun.position.set(-3, 4, 5); scene.add(sun);
  const rim = new THREE.DirectionalLight(0xffffff, 1.8);
  rim.position.set(3, -1, -3); scene.add(rim);
  const chip = new THREE.Group(); scene.add(chip);

  let seed = 517;
  const random = () => { seed = (1664525 * seed + 1013904223) >>> 0; return seed / 4294967296; };
  const bubbles = Array.from({ length: 44 }, () => ({ x: (random() - .5) * 1.45, y: (random() - .5) * 2.12, r: .035 + random() * .105, h: .018 + random() * .055 }));
  const surface = (x, y) => {
    let z = .14 * x * x + .055 * y * y + .08 * x * y + .01 * Math.sin(23 * x + y) * Math.cos(27 * y);
    for (const b of bubbles) z += b.h * Math.exp(-((x-b.x)**2 + (y-b.y)**2) / (b.r*b.r));
    return z;
  };
  const positions = [], uvs = [], indices = [];
  const nx=52, ny=68, planeCount=(nx+1)*(ny+1);
  for (let side=0; side<2; side++) {
    for (let j=0; j<=ny; j++) for (let i=0; i<=nx; i++) {
      const u=i/nx, v=j/ny;
      let x=(u-.5)*1.65, y=(v-.5)*2.3;
      x *= 1 - .055*Math.pow(Math.abs(y/1.15), 10);
      y *= 1 - .035*Math.pow(Math.abs(x/.825), 10);
      x += .012*Math.sin(j*2.7) + .008*Math.cos(j*1.3);
      y += .009*Math.sin(i*3.2);
      const z=surface(x,y)+(side===0 ? .045 : -.045);
      positions.push(x,y,z); uvs.push(u,v);
    }
    for (let j=0; j<ny; j++) for (let i=0; i<nx; i++) {
      const a=side*planeCount+j*(nx+1)+i, b=a+1, c=a+nx+1, d=c+1;
      if (side===0) indices.push(a,b,d,a,d,c); else indices.push(a,d,b,a,c,d);
    }
  }
  const edge=[];
  for(let i=0;i<=nx;i++)edge.push(i);
  for(let j=1;j<=ny;j++)edge.push(j*(nx+1)+nx);
  for(let i=nx-1;i>=0;i--)edge.push(ny*(nx+1)+i);
  for(let j=ny-1;j>0;j--)edge.push(j*(nx+1));
  for(let i=0;i<edge.length;i++){const a=edge[i],b=edge[(i+1)%edge.length];indices.push(a,a+planeCount,b+planeCount,a,b+planeCount,b);}
  const geometry=new THREE.BufferGeometry();
  geometry.setAttribute('position',new THREE.Float32BufferAttribute(positions,3));
  geometry.setAttribute('uv',new THREE.Float32BufferAttribute(uvs,2));
  geometry.setIndex(indices); geometry.computeVertexNormals();

  const size=256, pixels=new Uint8Array(size*size*4);
  const hash=(x,y)=>{const n=Math.sin(x*127.1+y*311.7)*43758.5453;return n-Math.floor(n);};
  const noise=(x,y)=>{const ix=Math.floor(x),iy=Math.floor(y);let u=x-ix,v=y-iy;u=u*u*(3-2*u);v=v*v*(3-2*v);return (hash(ix,iy)*(1-u)+hash(ix+1,iy)*u)*(1-v)+(hash(ix,iy+1)*(1-u)+hash(ix+1,iy+1)*u)*v;};
  for(let y=0;y<size;y++)for(let x=0;x<size;x++){
    const fine=random(), baked=noise(x/18,y/18), coarse=noise(x/49,y/49);
    const toast=Math.max(0,baked-.47)*105 + Math.max(0,coarse-.62)*55;
    const edgeToast=Math.max(0,(Math.max(Math.abs(x/size-.5),Math.abs(y/size-.5))-.44)*90);
    const shade=(fine-.5)*35-toast-edgeToast;
    const k=(y*size+x)*4;pixels[k]=Math.max(0,222+shade);pixels[k+1]=Math.max(0,165+shade);pixels[k+2]=Math.max(0,81+shade*.65);pixels[k+3]=255;
  }
  const texture=new THREE.DataTexture(pixels,size,size);texture.colorSpace=THREE.SRGBColorSpace;texture.magFilter=THREE.LinearFilter;texture.minFilter=THREE.LinearMipmapLinearFilter;texture.generateMipmaps=true;texture.needsUpdate=true;
  texture.anisotropy=Math.min(4,renderer.capabilities.getMaxAnisotropy());
  const material=new THREE.MeshStandardMaterial({map:texture,bumpMap:texture,bumpScale:.012,roughness:1,metalness:0});
  chip.add(new THREE.Mesh(geometry,material));
  chip.rotation.set(-.22,.45,-.32);
  const reduced=window.matchMedia('(prefers-reduced-motion: reduce)');
  let visible=false,raf=0,last=0,angle=.45,target=.45,lastScroll=window.scrollY,bounce=0,hovered=false;
  function draw(){renderer.render(scene,camera);}
  function tick(now){
    raf=0;if(!stage.isConnected){cleanup();return;}
    if(!visible||document.hidden)return;
    const dt=Math.min((now-(last||now))/1000,.05);last=now;
    angle+=(target-angle)*(1-Math.exp(-dt*4.8));bounce=Math.max(0,bounce-dt*1.3);
    chip.rotation.y=angle;chip.rotation.x=-.22+Math.sin(angle*1.3)*.2;chip.rotation.z=-.3+Math.sin(angle*.7)*.16;
    chip.position.y=Math.sin(bounce*Math.PI)*.38;
    const scale=1+Math.sin(bounce*Math.PI)*.07+(hovered?.035:0);chip.scale.setScalar(scale);
    draw();if(Math.abs(target-angle)>.001||bounce>0)raf=requestAnimationFrame(tick);
  }
  function start(){if(!raf&&visible&&!document.hidden){last=0;raf=requestAnimationFrame(tick);}}
  function stop(){cancelAnimationFrame(raf);raf=0;}
  function onScroll(){const current=window.scrollY;if(visible&&!reduced.matches)target=angle+Math.max(-Math.PI*1.5,Math.min(Math.PI*1.5,target-angle+(current-lastScroll)*.011));lastScroll=current;start();}
  function onClick(){if(reduced.matches){target=angle+Math.PI*.5;angle=target;chip.rotation.y=angle;draw();return;}target=Math.max(target,angle)+Math.PI*4;bounce=1;start();}
  function onEnter(){hovered=true;start();}function onLeave(){hovered=false;start();}
  function onReduced(){target=angle;bounce=0;stop();draw();}
  function onVisibility(){if(document.hidden)stop();else start();}
  const resize=new ResizeObserver(()=>{const {width,height}=stage.getBoundingClientRect();if(!width||!height)return;renderer.setSize(width,height,false);camera.aspect=width/height;camera.updateProjectionMatrix();draw();});resize.observe(stage);
  const observer=new IntersectionObserver(entries=>{visible=entries[0].isIntersecting;if(visible)start();else stop();});observer.observe(stage);
  window.addEventListener('scroll',onScroll,{passive:true});document.addEventListener('visibilitychange',onVisibility);reduced.addEventListener('change',onReduced);stage.addEventListener('click',onClick);stage.addEventListener('pointerenter',onEnter);stage.addEventListener('pointerleave',onLeave);
  function cleanup(){stop();observer.disconnect();resize.disconnect();window.removeEventListener('scroll',onScroll);document.removeEventListener('visibilitychange',onVisibility);reduced.removeEventListener('change',onReduced);stage.removeEventListener('click',onClick);stage.removeEventListener('pointerenter',onEnter);stage.removeEventListener('pointerleave',onLeave);geometry.dispose();material.dispose();texture.dispose();renderer.dispose();}
  const unload=event=>{if(event.target.contains(stage)){cleanup();document.removeEventListener('shopify:section:unload',unload);}};
  document.addEventListener('shopify:section:unload',unload);
}
