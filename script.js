const container = document.getElementById('webgl-container');
const scene = new THREE.Scene();
scene.fog = new THREE.FogExp2(0x020408, 0.015);

const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.set(0, 0, 8.5);

const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: "high-performance" });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
container.appendChild(renderer.domElement);

const galaxyCount = 8000;
const galaxyGeometry = new THREE.BufferGeometry();
const galaxyPositions = new Float32Array(galaxyCount * 3);
const galaxyColors = new Float32Array(galaxyCount * 3);
const colorInside = new THREE.Color(0xffddaa); 
const colorOutside = new THREE.Color(0x3b82f6); 

for(let i = 0; i < galaxyCount; i++) {
    const radius = Math.random() * 25;
    const branchAngle = ((i % 3) * Math.PI * 2) / 3;
    const spinAngle = radius * 0.3;

    const x = Math.cos(branchAngle + spinAngle) * radius + (Math.random() - 0.5) * 2;
    const y = (Math.random() - 0.5) * 1.5; 
    const z = Math.sin(branchAngle + spinAngle) * radius + (Math.random() - 0.5) * 2;

    galaxyPositions[i * 3] = x;
    galaxyPositions[i * 3 + 1] = y - 1.5; 
    galaxyPositions[i * 3 + 2] = z - 5;

    const mixedColor = colorInside.clone();
    mixedColor.lerp(colorOutside, radius / 25);

    galaxyColors[i * 3] = mixedColor.r;
    galaxyColors[i * 3 + 1] = mixedColor.g;
    galaxyColors[i * 3 + 2] = mixedColor.b;
}

galaxyGeometry.setAttribute('position', new THREE.BufferAttribute(galaxyPositions, 3));
galaxyGeometry.setAttribute('color', new THREE.BufferAttribute(galaxyColors, 3));

const galaxyMaterial = new THREE.PointsMaterial({
    size: 0.04,
    vertexColors: true,
    transparent: true,
    opacity: 0.8,
    blending: THREE.AdditiveBlending
});
const milkyWay = new THREE.Points(galaxyGeometry, galaxyMaterial);
scene.add(milkyWay);

const divineGroup = new THREE.Group();
divineGroup.position.set(0, 0.5, -6);
divineGroup.rotation.x = 0.1;
scene.add(divineGroup);

const divineCount = 1200;
const divineGeo = new THREE.BufferGeometry();
const divinePos = new Float32Array(divineCount * 3);
for(let i = 0; i < divineCount; i++) {
    const t = (i / divineCount) * Math.PI * 2;
    const px = Math.sin(t) * 7.0;
    const py = Math.cos(t * 2) * 0.8 + Math.sin(t) * 0.5;
    const pz = Math.cos(t) * 3.0 - 2.0;

    divinePos[i * 3] = px + (Math.random() - 0.5) * 0.4;
    divinePos[i * 3 + 1] = py + (Math.random() - 0.5) * 0.4;
    divinePos[i * 3 + 2] = pz + (Math.random() - 0.5) * 0.4;
}
divineGeo.setAttribute('position', new THREE.BufferAttribute(divinePos, 3));
const divineMat = new THREE.PointsMaterial({ color: 0xd4af37, size: 0.05, transparent: true, opacity: 0.7, blending: THREE.AdditiveBlending });
const divineForm = new THREE.Points(divineGeo, divineMat);
divineGroup.add(divineForm);

const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
scene.add(ambientLight);

const sunLight = new THREE.PointLight(0xffaa22, 3.0, 15);
sunLight.position.set(0, 0, 0);
scene.add(sunLight);

const artifactGroup = new THREE.Group();
scene.add(artifactGroup);

const materials = {
    obsidian: new THREE.MeshStandardMaterial({ color: 0x111115, roughness: 0.15, metalness: 0.9 }),
    titanium: new THREE.MeshStandardMaterial({ color: 0x8892b0, roughness: 0.3, metalness: 0.95 }),
    emerald: new THREE.MeshStandardMaterial({ color: 0x064e3b, roughness: 0.2, metalness: 0.85 }),
    quantum: new THREE.MeshStandardMaterial({ color: 0x00f2fe, roughness: 0.1, metalness: 0.95, emissive: 0x004455 }),
    goldTrim: new THREE.MeshStandardMaterial({ color: 0xd4af37, roughness: 0.25, metalness: 0.9 }),
    sun: new THREE.MeshBasicMaterial({ color: 0xffaa00 })
};

const coreGeometry = new THREE.TorusGeometry(2, 0.3, 32, 100);
const coreMesh = new THREE.Mesh(coreGeometry, materials.obsidian);
artifactGroup.add(coreMesh);

const innerRingGeo = new THREE.TorusGeometry(1.4, 0.12, 24, 80);
const innerRing = new THREE.Mesh(innerRingGeo, materials.goldTrim);
artifactGroup.add(innerRing);

const innermostGeo = new THREE.TorusGeometry(0.8, 0.08, 24, 80);
const innermostRing = new THREE.Mesh(innermostGeo, materials.titanium);
artifactGroup.add(innermostRing);

const sunGeo = new THREE.SphereGeometry(0.48, 32, 32);
const sunMesh = new THREE.Mesh(sunGeo, materials.sun);
artifactGroup.add(sunMesh);

let isExploded = false;
let showMesh = true;
let surgeMode = false;
let warpSpeed = 1.0;
let mouseX = 0, mouseY = 0;
let targetX = 0, targetY = 0;

document.addEventListener('mousemove', (e) => {
    mouseX = (e.clientX / window.innerWidth) * 2 - 1;
    mouseY = -(e.clientY / window.innerHeight) * 2 + 1;
});

function updateWarpSpeed(val) {
    warpSpeed = parseFloat(val);
    document.getElementById('warp-val').innerText = warpSpeed.toFixed(1) + 'x';
}

function triggerCosmicPulse() {
    let startTime = Date.now();
    function pulseAnim() {
        let elapsed = (Date.now() - startTime) / 400;
        if (elapsed > 1) {
            artifactGroup.scale.set(1, 1, 1);
            return;
        }
        let scale = 1 + Math.sin(elapsed * Math.PI) * 0.35;
        artifactGroup.scale.set(scale, scale, scale);
        requestAnimationFrame(pulseAnim);
    }
    pulseAnim();
}

function toggleMesh() {
    showMesh = !showMesh;
    milkyWay.visible = showMesh;
    divineGroup.visible = showMesh;
    const btn = document.getElementById('toggle-mesh');
    btn.classList.toggle('active', showMesh);
    btn.textContent = showMesh ? 'Enabled' : 'Disabled';
}

function toggleSurge() {
    surgeMode = !surgeMode;
    updateSurgeUI();
}

function updateSurgeUI() {
    const btn = document.getElementById('toggle-surge');
    btn.classList.toggle('active', surgeMode);
    btn.textContent = surgeMode ? 'Engaged' : 'Dormant';
    document.getElementById('stat-state').textContent = surgeMode ? 'Rampage' : 'Stable';
    document.getElementById('stat-state').style.color = surgeMode ? '#f43f5e' : '#fff';
    
    if (surgeMode) {
        sunLight.color.setHex(0xf43f5e);
        divineMat.color.setHex(0xf43f5e);
    } else {
        sunLight.color.setHex(0xffaa22);
        divineMat.color.setHex(0xd4af37);
    }
}

function switchMaterial(type) {
    document.querySelectorAll('.mat-btn').forEach(b => b.classList.remove('active'));
    event.target.classList.add('active');
    
    if (type === 'obsidian') coreMesh.material = materials.obsidian;
    if (type === 'titanium') coreMesh.material = materials.titanium;
    if (type === 'emerald') coreMesh.material = materials.emerald;
    if (type === 'quantum') coreMesh.material = materials.quantum;
}

function toggleExplode() {
    isExploded = !isExploded;
    let targetZ = isExploded ? 1.25 : 0;
    let startTime = Date.now();
    function animateTransition() {
        let elapsed = (Date.now() - startTime) / 600;
        if (elapsed > 1) elapsed = 1;
        innerRing.position.z = THREE.MathUtils.lerp(innerRing.position.z, targetZ, elapsed);
        innermostRing.position.z = THREE.MathUtils.lerp(innermostRing.position.z, -targetZ, elapsed);
        if (elapsed < 1) requestAnimationFrame(animateTransition);
    }
    animateTransition();
}

let clock = new THREE.Clock();
let frameCount = 0;
let lastTime = performance.now();

function animate() {
    requestAnimationFrame(animate);

    frameCount++;
    let currentTime = performance.now();
    if (currentTime - lastTime >= 1000) {
        const fps = Math.round((frameCount * 1000) / (currentTime - lastTime));
        const fpsElem = document.getElementById('stat-fps');
        if (fpsElem) fpsElem.innerText = fps;
        frameCount = 0;
        lastTime = currentTime;
    }

    let elapsedTime = clock.getElapsedTime();
    let speedMult = (surgeMode ? 2.5 : 1.0) * warpSpeed;

    targetX = mouseY * 0.4 + Math.sin(elapsedTime * 0.3) * 0.1;
    targetY = mouseX * 0.4 + Math.cos(elapsedTime * 0.2) * 0.15;

    artifactGroup.rotation.x += (targetX - artifactGroup.rotation.x) * 0.04;
    artifactGroup.rotation.y += (targetY - artifactGroup.rotation.y) * 0.04;

    milkyWay.rotation.y += 0.0008 * speedMult;
    divineGroup.rotation.y += 0.0004 * speedMult;

    coreMesh.rotation.z += 0.002 * speedMult;
    innerRing.rotation.x += 0.005 * speedMult;
    innerRing.rotation.y += 0.004 * speedMult;
    innermostRing.rotation.z -= 0.008 * speedMult;
    sunMesh.rotation.y += 0.005 * speedMult;

    renderer.render(scene, camera);
}
animate();

window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});