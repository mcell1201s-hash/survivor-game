import {test,expect} from '@playwright/test';
test.beforeEach(async({page})=>{await page.goto('/');await page.locator('#start').waitFor();});
test('start, movement, pause, retry and layout',async({page},info)=>{
 const errors=[];page.on('pageerror',e=>errors.push(e.message));await page.click('#start');await expect(page.locator('#hud')).toBeVisible();
 const before=await page.evaluate(()=>window.__gameScene.player.x);
 if(info.project.name==='desktop'){await page.keyboard.down('d');await page.waitForTimeout(400);await page.keyboard.up('d');}
 else {const r=await page.locator('#joystick').boundingBox();await page.mouse.move(r.x+56,r.y+56);await page.mouse.down();await page.mouse.move(r.x+90,r.y+56);await page.waitForTimeout(400);await page.mouse.up();}
 expect(await page.evaluate(()=>window.__gameScene.player.x)).toBeGreaterThan(before+10);
 await page.click('#pause');const t=await page.evaluate(()=>window.__gameScene.elapsed);await page.waitForTimeout(200);expect(await page.evaluate(()=>window.__gameScene.elapsed)).toBe(t);await page.click('#resume');
 await page.evaluate(()=>{window.__gameScene.stats.hp=1;window.__gameScene.spawn();const s=window.__gameScene;s.enemies[0].setPosition(s.player.x,s.player.y);s.hurtClock=0;});await expect(page.locator('#retry')).toBeVisible();await page.click('#retry');expect(await page.evaluate(()=>window.__gameScene.stats.kills)).toBe(0);
 expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth&&document.documentElement.scrollHeight<=innerHeight)).toBe(true);expect(errors).toEqual([]);
 await page.screenshot({path:`test-results/${info.project.name}.png`});
});
test('automatic attacks, gem collection and three upgrade choices',async({page})=>{
 await page.click('#start');await page.evaluate(()=>{const s=window.__gameScene;s.spawnClock=100;s.spawn();s.enemies[0].setPosition(s.player.x+50,s.player.y);s.enemies[0].hp=1;s.enemies[0].speed=0;});
 await expect.poll(()=>page.evaluate(()=>window.__gameScene.stats.kills)).toBe(1);
 await expect.poll(()=>page.evaluate(()=>window.__gameScene.stats.xp)).toBe(1);
 await page.evaluate(()=>{const s=window.__gameScene;s.stats.xp=s.requiredXP();});await expect(page.locator('.choice')).toHaveCount(3);await page.locator('.choice').first().click();expect(await page.evaluate(()=>window.__gameScene.mode)).toBe('playing');expect(await page.evaluate(()=>window.__gameScene.stats.level)).toBe(2);
});
test('difficulty increases and survival at five minutes wins',async({page})=>{
 await page.click('#start');const kinds=await page.evaluate(()=>{const s=window.__gameScene;s.elapsed=180;for(let i=0;i<50;i++)s.spawn();return [...new Set(s.enemies.map(e=>e.texture.key))];});expect(kinds.sort()).toEqual(['bat','golem','slime']);await page.evaluate(()=>{window.__gameScene.elapsed=299.99;});await expect(page.locator('#overlay')).toContainText('夜明けが来た');await expect(page.locator('#timer')).toContainText('5:00');await page.click('#retry');expect(await page.evaluate(()=>window.__gameScene.elapsed)).toBeLessThan(1);
});
