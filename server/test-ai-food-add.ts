
import { createFoodItem, deleteFoodItem } from './src/modules/foods/food-controller';
import { Request, Response } from 'express';

// Minimal Mock Request
const mockReq = (body: any, params: any = {}) => ({
    body,
    params,
} as unknown as Request);

// Minimal Mock Response
const mockRes = () => {
    const res: any = {};
    res.status = (code: number) => {
        res.statusCode = code;
        return res;
    };
    res.json = (data: any) => {
        res.data = data;
        return res;
    };
    return res as unknown as Response & { data: any, statusCode: number };
};

async function test() {
    console.log("Starting AI Food Add Test...");
    // specific enough to likely get good AI results
    const req = mockReq({ name: 'Fresh Banana' });
    const res = mockRes();

    try {
        await createFoodItem(req, res);

        if (res.data && res.data.success) {
            const item = res.data.data;
            console.log('Food Item Created:', JSON.stringify(item, null, 2));

            let pass = true;
            if (!item.category) { console.error('FAIL: Category missing'); pass = false; }
            if (!item.typicalExpirationDays) { console.error('FAIL: Expiration missing'); pass = false; }
            if (!item.nutritionPerUnit) { console.error('FAIL: Nutrition missing'); pass = false; }

            if (pass) {
                console.log('SUCCESS: All AI fields populated.');
            } else {
                console.log('SOME CHECKS FAILED.');
            }

            // Cleanup
            console.log('Cleaning up...');
            const delReq = mockReq({}, { id: item.id });
            const delRes = mockRes();
            await deleteFoodItem(delReq, delRes);
            console.log('Cleanup done.');
        } else {
            console.error('FAIL: Creation failed', res.data);
        }
    } catch (e) {
        console.error('Test Error:', e);
    }
}

test();
