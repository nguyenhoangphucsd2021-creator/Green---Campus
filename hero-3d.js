/* Green Campus: procedural Three.js hero scene. Falls back to the Canvas artwork if WebGL/CDN is unavailable. */
(async function () {
  const host = document.querySelector('.hero');
  const fallback = document.querySelector('#hero-canvas');
  if (!host || !fallback || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  try {
    const THREE = await import('https://cdn.jsdelivr.net/npm/three@0.170.0/build/three.module.js');
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(38, 1, 0.1, 100);
    camera.position.set(0, 0, 8.8);
    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true, powerPreference: 'low-power' });
    renderer.setPixelRatio(Math.min(devicePixelRatio || 1, 1.7));
    renderer.setSize(host.clientWidth, host.clientHeight);
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.domElement.className = 'hero-webgl';
    renderer.domElement.setAttribute('aria-hidden', 'true');
    host.insertBefore(renderer.domElement, host.firstChild);

    const group = new THREE.Group(); scene.add(group);
    const textureCanvas = document.createElement('canvas'); textureCanvas.width = 1024; textureCanvas.height = 512;
    const ctx = textureCanvas.getContext('2d');
    const gradient = ctx.createLinearGradient(0, 0, 1024, 512);
    gradient.addColorStop(0, '#b9e9a1'); gradient.addColorStop(.35, '#377f56'); gradient.addColorStop(1, '#082b20');
    ctx.fillStyle = gradient; ctx.fillRect(0, 0, 1024, 512);
    // Procedural continent-like silhouettes; intentionally illustrative, not geographic data.
    ctx.fillStyle = '#a6d58b'; ctx.globalAlpha = .78;
    const land = [ [[130,105],[190,70],[245,90],[260,145],[225,190],[200,250],[155,230],[120,170]], [[300,260],[350,235],[380,280],[360,360],[330,420],[300,350]], [[500,95],[560,70],[620,100],[650,150],[610,190],[570,175],[535,220],[490,160]], [[650,245],[720,220],[770,260],[755,330],[700,355],[665,310]], [[820,100],[875,120],[900,165],[860,195],[825,165]] ];
    land.forEach(poly => { ctx.beginPath(); poly.forEach((p,i)=>i?ctx.lineTo(p[0],p[1]):ctx.moveTo(p[0],p[1])); ctx.closePath(); ctx.fill(); });
    ctx.globalAlpha = 1;
    for(let i=0;i<1800;i++){const x=Math.random()*1024,y=Math.random()*512;ctx.fillStyle=Math.random()>.5?'rgba(220,255,195,.12)':'rgba(0,20,12,.12)';ctx.fillRect(x,y,1+Math.random()*3,1+Math.random()*2);}
    const mapTexture = new THREE.CanvasTexture(textureCanvas); mapTexture.colorSpace = THREE.SRGBColorSpace;
    const earth = new THREE.Mesh(new THREE.SphereGeometry(2.05, 96, 72), new THREE.MeshStandardMaterial({ map: mapTexture, roughness: .82, metalness: .04 }));
    group.add(earth);
    const atmosphere = new THREE.Mesh(new THREE.SphereGeometry(2.12, 64, 64), new THREE.MeshBasicMaterial({ color: 0x9cff9e, transparent: true, opacity: .09, side: THREE.BackSide })); group.add(atmosphere);
    const ring = new THREE.Mesh(new THREE.TorusGeometry(2.72, .008, 8, 180), new THREE.MeshBasicMaterial({ color: 0xb7f38a, transparent: true, opacity: .48 })); ring.rotation.set(.92, .18, -.35); group.add(ring);
    const ring2 = new THREE.Mesh(new THREE.TorusGeometry(3.05, .004, 6, 180), new THREE.MeshBasicMaterial({ color: 0x8edda4, transparent: true, opacity: .24 })); ring2.rotation.set(1.08, -.22, .5); group.add(ring2);
    const starGeo = new THREE.BufferGeometry(), starCount = 850, positions = new Float32Array(starCount*3);
    for(let i=0;i<starCount;i++){const radius=3.4+Math.random()*7,theta=Math.random()*Math.PI*2,phi=Math.acos(2*Math.random()-1);positions[i*3]=radius*Math.sin(phi)*Math.cos(theta);positions[i*3+1]=radius*Math.sin(phi)*Math.sin(theta);positions[i*3+2]=radius*Math.cos(phi);}
    starGeo.setAttribute('position',new THREE.BufferAttribute(positions,3));
    const stars = new THREE.Points(starGeo,new THREE.PointsMaterial({color:0xd8ffc5,size:.018,transparent:true,opacity:.8}));scene.add(stars);
    scene.add(new THREE.AmbientLight(0x9ed8a5, 1.45));
    const key = new THREE.DirectionalLight(0xe2ffd0, 2.4); key.position.set(-3,4,5); scene.add(key);
    const rim = new THREE.PointLight(0x58e68d, 18, 12); rim.position.set(3,-1,-3); scene.add(rim);
    let px=0,py=0,frame=0;
    host.addEventListener('pointermove',e=>{const r=host.getBoundingClientRect();px=((e.clientX-r.left)/r.width-.5)*.5;py=((e.clientY-r.top)/r.height-.5)*.3;},{passive:true});
    const resize=()=>{const w=host.clientWidth,h=host.clientHeight;camera.aspect=w/h;camera.updateProjectionMatrix();renderer.setSize(w,h);};
    const observer=new ResizeObserver(resize);observer.observe(host);
    function animate(){if(!host.isConnected){observer.disconnect();renderer.dispose();return;}frame+=.003;group.rotation.y=frame*.32+px;group.rotation.x=py*.35;ring.rotation.z-=.0007;stars.rotation.y=-frame*.025;renderer.render(scene,camera);requestAnimationFrame(animate);}
    fallback.style.display='none'; animate();
  } catch (error) {
    console.info('Three.js chưa tải được; sử dụng đồ họa dự phòng.', error);
  }
})();
