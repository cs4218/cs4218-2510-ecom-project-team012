import { test, expect } from '@playwright/test';

// test generated with playwright codegen and formatted with AI assistance

const originalProfile = {
    name: 'Bob',
    password: 'alicealice',
    phone: '12341234',
    address: '2 Street',
    email: 'bob@bob.com',
};

const updatedProfile = {
    name: 'Alice',
    password: 'bobbobbob',
    phone: '43214321',
    address: '1 Avenue',
};

async function login(page, email, password) {
    await page.goto('/');
    await page.getByRole('link', { name: 'Login' }).click();
    await page.getByRole('textbox', { name: 'Enter Your Email' }).fill(email);
    await page.getByRole('textbox', { name: 'Enter Your Password' }).fill(password);
    await page.getByRole('button', { name: 'LOGIN' }).click();
}

async function goToProfile(page, name) {
    await page.getByRole('button', { name }).click();
    await page.getByRole('link', { name: 'Dashboard' }).click();
    await page.getByRole('link', { name: 'Profile' }).click();
}

test('User can update and restore profile', async ({ page }) => {
    // 1. Login and navigate to profile
    await login(page, originalProfile.email, originalProfile.password);
    await goToProfile(page, originalProfile.name);

    // 2. Update profile fields
    await page.getByRole('textbox', { name: 'Enter Your Name' }).fill(updatedProfile.name);
    await page.getByRole('textbox', { name: 'Enter Your Password' }).fill(updatedProfile.password);
    await page.getByRole('textbox', { name: 'Enter Your Phone' }).fill(updatedProfile.phone);
    await page.getByRole('textbox', { name: 'Enter Your Address' }).fill(updatedProfile.address);
    await page.getByRole('button', { name: 'UPDATE' }).click();

    // 3. Assert success toast
    await expect(page.getByText('Profile Updated Successfully')).toBeVisible({ timeout: 5000 });

    // 4. Check updated dashboard details with exact match
    await page.getByRole('button', { name: updatedProfile.name }).click();
    await page.getByRole('link', { name: 'Dashboard' }).click();
    await expect(page.getByRole('heading', { name: updatedProfile.name, exact: true })).toBeVisible();
    await expect(page.getByRole('heading', { name: originalProfile.email, exact: true })).toBeVisible();
    await expect(page.getByRole('heading', { name: /Avenue/, exact: true })).toBeVisible();

    // 5. Logout and re-login using new password
    await page.getByRole('button', { name: updatedProfile.name }).click();
    await page.getByRole('link', { name: 'Logout' }).click();
    await login(page, originalProfile.email, updatedProfile.password);
    await goToProfile(page, updatedProfile.name);

    // 6. Restore original profile
    await page.getByRole('textbox', { name: 'Enter Your Name' }).fill(originalProfile.name);
    await page.getByRole('textbox', { name: 'Enter Your Password' }).fill(originalProfile.password);
    await page.getByRole('textbox', { name: 'Enter Your Phone' }).fill(originalProfile.phone);
    await page.getByRole('textbox', { name: 'Enter Your Address' }).fill(originalProfile.address);
    await page.getByRole('button', { name: 'UPDATE' }).click();
    await expect(page.getByText('Profile Updated Successfully')).toBeVisible({ timeout: 5000 });

    // 7. Verify restoration on dashboard with exact match
    await page.getByRole('button', { name: originalProfile.name }).click();
    await page.getByRole('link', { name: 'Dashboard' }).click();
    await expect(page.getByRole('heading', { name: originalProfile.name, exact: true })).toBeVisible();
    await expect(page.getByRole('heading', { name: originalProfile.email, exact: true })).toBeVisible();
    await expect(page.getByRole('heading', { name: /Street/, exact: true })).toBeVisible();
});
