import type { FacultiesState } from './faculty.types'

export const INITIAL_FACULTIES_DATA: FacultiesState = {
  faculty_management: {
    id: 'faculty_management',
    name: 'Կառավարման ֆակուլտետ',
    description: 'Բիզնեսի և պետական կառավարման մասնագիտացումներ',
    buildingName: 'Մասնաշենք 1',
    floorsCount: 3,
    professors: [
      'Աբրամ Բախչագուլյան',
      'Ազատ Քալանթարյան',
      'Կարինե Գրիգորյան',
      'Սամվել Մանուկյան',
      'Արփինե Դավթյան',
      'Հրանտ Բաբայան',
      'Գայանե Հակոբյան'
    ],
    courses: [
      'Management 101',
      'HR ռազմավարություն',
      'Ռազմավարական կառավարում',
      'Բիզնես պլանավորում',
      'Մարդկային ռեսուրսների կառավարում',
      'Լիդերություն և թիմային աշխատանք',
      'Նախագծերի կառավարում'
    ],
    classrooms: {
      floor_1: ['104', '105', '107', '108', '110', '111', '112'],
      floor_2: ['204', '205', '207', '214', '215', '217', '221'],
      floor_3: ['302', '303', '304', '305', '307', '308', '311', '312', '315', '327', '328', '329']
    },
    schedule: {
      monday: {
        '1-2': { course: 'Management 101', professor: 'Աբրամ Բախչագուլյան', classroom: '104' },
        '3-4': { course: 'HR ռազմավարություն', professor: 'Ազատ Քալանթարյան', classroom: '204' },
        '5-6': { course: 'Ռազմավարական կառավարում', professor: 'Կարինե Գրիգորյան', classroom: '302' },
        '7-8': { course: '', professor: '', classroom: '' },
        '9-10': { course: '', professor: '', classroom: '' },
        '11-12': { course: '', professor: '', classroom: '' },
      },
      tuesday: {
        '1-2': { course: 'Բիզնես պլանավորում', professor: 'Սամվել Մանուկյան', classroom: '105' },
        '3-4': { course: 'Management 101', professor: 'Աբրամ Բախչագուլյան', classroom: '107' },
        '5-6': { course: '', professor: '', classroom: '' },
        '7-8': { course: '', professor: '', classroom: '' },
        '9-10': { course: '', professor: '', classroom: '' },
        '11-12': { course: '', professor: '', classroom: '' },
      },
      wednesday: {
        '1-2': { course: 'Լիդերություն և թիմային աշխատանք', professor: 'Արփինե Դավթյան', classroom: '214' },
        '3-4': { course: 'Ռազմավարական կառավարում', professor: 'Կարինե Գրիգորյան', classroom: '215' },
        '5-6': { course: '', professor: '', classroom: '' },
        '7-8': { course: '', professor: '', classroom: '' },
        '9-10': { course: '', professor: '', classroom: '' },
        '11-12': { course: '', professor: '', classroom: '' },
      },
      thursday: {
        '1-2': { course: 'Նախագծերի կառավարում', professor: 'Հրանտ Բաբայան', classroom: '305' },
        '3-4': { course: 'HR ռազմավարություն', professor: 'Ազատ Քալանթարյան', classroom: '308' },
        '5-6': { course: '', professor: '', classroom: '' },
        '7-8': { course: '', professor: '', classroom: '' },
        '9-10': { course: '', professor: '', classroom: '' },
        '11-12': { course: '', professor: '', classroom: '' },
      },
      friday: {
        '1-2': { course: 'Մարդկային ռեսուրսների կառավարում', professor: 'Գայանե Հակոբյան', classroom: '110' },
        '3-4': { course: 'Բիզնես պլանավորում', professor: 'Սամվել Մանուկյան', classroom: '111' },
        '5-6': { course: '', professor: '', classroom: '' },
        '7-8': { course: '', professor: '', classroom: '' },
        '9-10': { course: '', professor: '', classroom: '' },
        '11-12': { course: '', professor: '', classroom: '' },
      }
    }
  },
  faculty_finance: {
    id: 'faculty_finance',
    name: 'Կիրառական ֆինանսների ֆակուլտետ',
    description: 'Բանկային գործ, ապահովագրություն և աուդիտ',
    buildingName: 'Մասնաշենք 2',
    floorsCount: 3,
    professors: [
      'Երկանյան Աննա',
      'Երվանդյան Չուխրա',
      'Լևոն Սարգսյան',
      'Գոհար Ավագյան',
      'Վահագն Խաչատրյան',
      'Մարիամ Պետրոսյան'
    ],
    courses: [
      'Կորպորատիվ ֆինանսներ',
      'Բանկային գործ',
      'Հաշվապահական հաշվառում',
      'Աուդիտ և վերահսկողություն',
      'Ֆինանսական շուկաներ',
      'Միջազգային արժութային հարաբերություններ'
    ],
    classrooms: {
      floor_1: ['101', '102', '104', '105', '106'],
      floor_2: ['201', '202', '205', '206', '207', '208', '210', '211', '212'],
      floor_3: ['301', '302', '303', '305', '306', '307', '308', '309', '310', '311', '312', '314', '317']
    },
    schedule: {
      monday: {
        '1-2': { course: 'Կորպորատիվ ֆինանսներ', professor: 'Երկանյան Աննա', classroom: '101' },
        '3-4': { course: 'Բանկային գործ', professor: 'Երվանդյան Չուխրա', classroom: '201' },
        '5-6': { course: '', professor: '', classroom: '' },
        '7-8': { course: '', professor: '', classroom: '' },
        '9-10': { course: '', professor: '', classroom: '' },
        '11-12': { course: '', professor: '', classroom: '' },
      },
      tuesday: {
        '1-2': { course: 'Հաշվապահական հաշվառում', professor: 'Լևոն Սարգսյան', classroom: '205' },
        '3-4': { course: 'Աուդիտ և վերահսկողություն', professor: 'Գոհար Ավագյան', classroom: '207' },
        '5-6': { course: '', professor: '', classroom: '' },
        '7-8': { course: '', professor: '', classroom: '' },
        '9-10': { course: '', professor: '', classroom: '' },
        '11-12': { course: '', professor: '', classroom: '' },
      },
      wednesday: {
        '1-2': { course: 'Ֆինանսական շուկաներ', professor: 'Վահագն Խաչատրյան', classroom: '301' },
        '3-4': { course: 'Կորպորատիվ ֆինանսներ', professor: 'Երկանյան Աննա', classroom: '302' },
        '5-6': { course: '', professor: '', classroom: '' },
        '7-8': { course: '', professor: '', classroom: '' },
        '9-10': { course: '', professor: '', classroom: '' },
        '11-12': { course: '', professor: '', classroom: '' },
      },
      thursday: {
        '1-2': { course: 'Բանկային գործ', professor: 'Երվանդյան Չուխրա', classroom: '102' },
        '3-4': { course: 'Միջազգային արժութային հարաբերություններ', professor: 'Մարիամ Պետրոսյան', classroom: '305' },
        '5-6': { course: '', professor: '', classroom: '' },
        '7-8': { course: '', professor: '', classroom: '' },
        '9-10': { course: '', professor: '', classroom: '' },
        '11-12': { course: '', professor: '', classroom: '' },
      },
      friday: {
        '1-2': { course: 'Հաշվապահական հաշվառում', professor: 'Լևոն Սարգսյան', classroom: '105' },
        '3-4': { course: 'Ֆինանսական շուկաներ', professor: 'Վահագն Խաչատրյան', classroom: '206' },
        '5-6': { course: '', professor: '', classroom: '' },
        '7-8': { course: '', professor: '', classroom: '' },
        '9-10': { course: '', professor: '', classroom: '' },
        '11-12': { course: '', professor: '', classroom: '' },
      }
    }
  },
  faculty_economics: {
    id: 'faculty_economics',
    name: 'Տնտեսագիտական ֆակուլտետ',
    description: 'Տնտեսության տեսություն, մակրո և միկրոէկոնոմիկա (9 հարկանի համալիր)',
    buildingName: 'Գլխավոր Մասնաշենք (9 հարկ)',
    floorsCount: 9,
    professors: [
      'Գագիկ Աղաջանյան',
      'Արմեն Ղուկասյան',
      'Սոնա Հարությունյան',
      'Տիգրան Մարտիրոսյան',
      'Անուշ Խաչատրյան',
      'Դավիթ Կիրակոսյան'
    ],
    courses: [
      'Մակրոտնտեսագիտություն',
      'Միկրոտնտեսագիտություն',
      'Էկոնոմետրիկա',
      'Հանրային ֆինանսներ',
      'Տնտեսական պատմություն',
      'Տնտեսական մոդելավորում'
    ],
    classrooms: {
      floor_1: ['101', '102', '103', '105', '108', '112'],
      floor_2: ['201', '202', '204', '206', '210', '215'],
      floor_3: ['301', '302', '305', '308', '311', '314'],
      floor_4: ['401', '403', '405', '408', '410', '412'],
      floor_5: ['501', '502', '504', '506', '509', '515'],
      floor_6: ['601', '603', '605', '607', '610', '614'],
      floor_7: ['701', '702', '704', '708', '711', '712'],
      floor_8: ['801', '803', '805', '806', '810', '814'],
      floor_9: ['901', '902', '903', '905', '908', '910']
    },
    schedule: {
      monday: {
        '1-2': { course: 'Մակրոտնտեսագիտություն', professor: 'Գագիկ Աղաջանյան', classroom: '101' },
        '3-4': { course: 'Միկրոտնտեսագիտություն', professor: 'Արմեն Ղուկասյան', classroom: '401' },
        '5-6': { course: 'Էկոնոմետրիկա', professor: 'Սոնա Հարությունյան', classroom: '901' },
        '7-8': { course: '', professor: '', classroom: '' },
        '9-10': { course: '', professor: '', classroom: '' },
        '11-12': { course: '', professor: '', classroom: '' },
      },
      tuesday: {
        '1-2': { course: 'Հանրային ֆինանսներ', professor: 'Տիգրան Մարտիրոսյան', classroom: '202' },
        '3-4': { course: 'Տնտեսական պատմություն', professor: 'Անուշ Խաչատրյան', classroom: '504' },
        '5-6': { course: '', professor: '', classroom: '' },
        '7-8': { course: '', professor: '', classroom: '' },
        '9-10': { course: '', professor: '', classroom: '' },
        '11-12': { course: '', professor: '', classroom: '' },
      },
      wednesday: {
        '1-2': { course: 'Էկոնոմետրիկա', professor: 'Սոնա Հարությունյան', classroom: '702' },
        '3-4': { course: 'Մակրոտնտեսագիտություն', professor: 'Գագիկ Աղաջանյան', classroom: '803' },
        '5-6': { course: '', professor: '', classroom: '' },
        '7-8': { course: '', professor: '', classroom: '' },
        '9-10': { course: '', professor: '', classroom: '' },
        '11-12': { course: '', professor: '', classroom: '' },
      },
      thursday: {
        '1-2': { course: 'Միկրոտնտեսագիտություն', professor: 'Արմեն Ղուկասյան', classroom: '301' },
        '3-4': { course: 'Տնտեսական մոդելավորում', professor: 'Դավիթ Կիրակոսյան', classroom: '601' },
        '5-6': { course: '', professor: '', classroom: '' },
        '7-8': { course: '', professor: '', classroom: '' },
        '9-10': { course: '', professor: '', classroom: '' },
        '11-12': { course: '', professor: '', classroom: '' },
      },
      friday: {
        '1-2': { course: 'Հանրային ֆինանսներ', professor: 'Տիգրան Մարտիրոսյան', classroom: '908' },
        '3-4': { course: 'Էկոնոմետրիկա', professor: 'Սոնա Հարությունյան', classroom: '509' },
        '5-6': { course: '', professor: '', classroom: '' },
        '7-8': { course: '', professor: '', classroom: '' },
        '9-10': { course: '', professor: '', classroom: '' },
        '11-12': { course: '', professor: '', classroom: '' },
      }
    }
  },
  faculty_marketing: {
    id: 'faculty_marketing',
    name: 'Մարքեթինգի և բիզնեսի ֆակուլտետ',
    description: 'Մարքեթինգային հաղորդակցություններ, PR և բրենդինգ',
    buildingName: 'Մասնաշենք 3',
    floorsCount: 3,
    professors: [
      'Անահիտ Մելքոնյան',
      'Վահան Դանիելյան',
      'Լիլիթ Պետրոսյան',
      'Նաիրա Բաղդասարյան',
      'Գարիկ Բաբայան'
    ],
    courses: [
      'Թվային մարքեթինգ',
      'Բրենդ մենեջմենթ',
      'PR տեխնոլոգիաներ',
      'Սպառողական վարքագիծ',
      'Գովազդային գործունեություն',
      'Մեդիա պլանավորում'
    ],
    classrooms: {
      floor_1: ['101', '102', '104', '105'],
      floor_2: ['201', '202', '204', 'Չինական լսարան'],
      floor_3: ['301', '303', '306', '309']
    },
    schedule: {
      monday: {
        '1-2': { course: 'Թվային մարքեթինգ', professor: 'Անահիտ Մելքոնյան', classroom: 'Չինական լսարան' },
        '3-4': { course: 'Բրենդ մենեջմենթ', professor: 'Վահան Դանիելյան', classroom: '201' },
        '5-6': { course: '', professor: '', classroom: '' },
        '7-8': { course: '', professor: '', classroom: '' },
        '9-10': { course: '', professor: '', classroom: '' },
        '11-12': { course: '', professor: '', classroom: '' },
      },
      tuesday: {
        '1-2': { course: 'PR տեխնոլոգիաներ', professor: 'Լիլիթ Պետրոսյան', classroom: '101' },
        '3-4': { course: 'Սպառողական վարքագիծ', professor: 'Նաիրա Բաղդասարյան', classroom: 'Չինական լսարան' },
        '5-6': { course: '', professor: '', classroom: '' },
        '7-8': { course: '', professor: '', classroom: '' },
        '9-10': { course: '', professor: '', classroom: '' },
        '11-12': { course: '', professor: '', classroom: '' },
      },
      wednesday: {
        '1-2': { course: 'Գովազդային գործունեություն', professor: 'Գարիկ Բաբայան', classroom: '301' },
        '3-4': { course: 'Թվային մարքեթինգ', professor: 'Անահիտ Մելքոնյան', classroom: '202' },
        '5-6': { course: '', professor: '', classroom: '' },
        '7-8': { course: '', professor: '', classroom: '' },
        '9-10': { course: '', professor: '', classroom: '' },
        '11-12': { course: '', professor: '', classroom: '' },
      },
      thursday: {
        '1-2': { course: 'Բրենդ մենեջմենթ', professor: 'Վահան Դանիելյան', classroom: '102' },
        '3-4': { course: 'Մեդիա պլանավորում', professor: 'Անահիտ Մելքոնյան', classroom: 'Չինական լսարան' },
        '5-6': { course: '', professor: '', classroom: '' },
        '7-8': { course: '', professor: '', classroom: '' },
        '9-10': { course: '', professor: '', classroom: '' },
        '11-12': { course: '', professor: '', classroom: '' },
      },
      friday: {
        '1-2': { course: 'PR տեխնոլոգիաներ', professor: 'Լիլիթ Պետրոսյան', classroom: '204' },
        '3-4': { course: 'Սպառողական վարքագիծ', professor: 'Նաիրա Բաղդասարյան', classroom: '306' },
        '5-6': { course: '', professor: '', classroom: '' },
        '7-8': { course: '', professor: '', classroom: '' },
        '9-10': { course: '', professor: '', classroom: '' },
        '11-12': { course: '', professor: '', classroom: '' },
      }
    }
  }
}
