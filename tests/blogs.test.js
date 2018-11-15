const Page = require('./helpers/page');

let page;

beforeEach(async () => {
    page = await Page.build();
    await page.goto('localhost:3000');
});

afterEach(async () => {
    await page.close();
});


describe('When logged in', () => {

    beforeEach(async () => {
        await page.login();
        await page.click('a.btn-floating');
    });

    test('Can see blog create form', async () => {
        const label = await page.getContentsOf('form label');
        expect(label).toEqual('Blog Title');
    });

    describe('Using valid inputs', () => {

        beforeEach(async () => {
            await page.type('.title input', 'Title text 123');
            await page.type('.content input', 'Content text 123321');
            await page.click('form button');
        });

        test('Submitting takes user to review screen', async () => {
            const text = await page.getContentsOf('h5');
            expect(text).toEqual('Please confirm your entries');
        });

        test('Submitting then saving adds blog to blogs page', async () => {
            await page.click('button.green');
            await page.waitFor('.card');
            const title = await page.getContentsOf('.card-title');
            const content = await page.getContentsOf('p');
            expect(title).toEqual('Title text 123');
            expect(content).toEqual('Content text 123321');
        });

    });

    describe('Using invalid inputs', () => {

        beforeEach(async () => {
            await page.click('form button');
        });

        test('The form shows an error message', async () => {
            const titleError = await page.getContentsOf('.title .red-text');
            const contentError = await page.getContentsOf('.content .red-text');
            expect(titleError).toEqual('You must provide a value');
            expect(contentError).toEqual('You must provide a value');
        });

    })
});

describe('When user in not logged in', () => {

    const actions = [
        {
            method: 'get',
            path: '/api/blogs'
        },
        {
            method: 'post',
            path: '/api/blogs',
            data: {
                title: 'T',
                content: 'C'
            }
        }
    ];

    test('Blog related actions are prohibited', async () => {
        const results = await page.execRequests(actions);
        results.forEach(result => {
            expect(result).toEqual({error: 'You must log in!'});
        });
    });

    // test('User cannot create blog', async () => {
    //     const result = await page.post('/api/blogs', {title: 'New title 123', content: 'New content 123'});
    //     expect(result).toEqual({error: 'You must log in!'});
    // });
    //
    // test('User cannot get a list of blogs', async () => {
    //     const result = await page.get('/api/blogs');
    //     expect(result).toEqual({error: 'You must log in!'});
    // });

});