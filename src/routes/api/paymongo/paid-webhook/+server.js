import { addDoc, getDoc, updateDoc, doc, collection, serverTimestamp } from 'firebase/firestore'
import { db } from '$lib/firebase/client';

/** @type {import('./$types').RequestHandler} */
export async function GET() {
    return new Response('hello');
};

/** @type {import('./$types').RequestHandler} */
export async function POST({request}) {
    const body = await request.json()
    await addDoc(collection(db, 'paymongo'), body)
    const paymentDesc = body.data.attributes.data.attributes.description
    const paymentID = body.data.attributes.data.attributes.remarks
    const paymentMethod = body.data.attributes.data.attributes.data.attributes.source.type
    if (paymentDesc == 'Clubhouse Reservation Downpayment') {
        await updateDoc(doc(db, 'booking', paymentID), {paymentStatus: 'Paid'})
    } else {
        await updateDoc(doc(db, 'accounts', paymentID), {paymentStatus: 'Paid'})
        const docRef = doc(db, 'accounts', paymentID);
        const docSnapshot = await getDoc(docRef)
        const user = docSnapshot.data()
        await addDoc(collection(db, 'payments'), {
			firstName: user.firstname,
			firstNameDisplay: user.firstNameDisplay,
			lastName: user.lastname,
			lastNameDisplay: user.lastNameDisplay,
			contact: user.contactNumber,
			email: user.email,
			addressBlock: user.addressBlock,
			addressLot: user.addressLot,
			addressStreet: user.addressStreet,
            paymentMethod: paymentMethod.charAt(0).toUpperCase() + paymentMethod.slice(1),
			paymentTime: serverTimestamp()
		})
    }
    return new Response();
};