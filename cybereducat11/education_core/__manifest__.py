{
    'name': 'eEducation ERP Core',
    'version': '11.0.1.0.1',
    'summary': """Core Module of Education ERP""",
    'description': 'Core Module of Education ERP',
    'category': 'Education',
    'author': 'Md. Shaheen Hossain',
    'company': 'Eagle ERP ',
    'website': "http://www.eagle-it-services.com",
    'depends': ['base', 'mail', 'stock', 'hr_recruitment'],
    'data': [
        'security/education_security.xml',
        'security/ir.model.access.csv',
        'data/gurdian.student.relation.csv',
        'data/education.class.csv',
        'data/education.academic.year.csv',
        # 'data/education_class_section.csv',
        # 'data/education_division.csv',
        'data/education_core.xml',
        'views/education_main_menu.xml',
        'views/education_res_partner.xml',
        'views/education_application_reject.xml',
        'views/education_academic_year.xml',
        'views/application_reject_reason.xml',
        'views/education_recruitment.xml',
        'views/education_class_wizard.xml',
        'views/education_admission.xml',
        'views/education_class.xml',
        'views/education_class_division.xml',
        'views/education_student.xml',
        'views/education_student_class.xml',
        'views/education_faculty.xml',
        'views/education_documents.xml',
        'views/education_document_type.xml',
        'views/sequence.xml',
        'views/education_res_company.xml',
        'views/education_division.xml',
        'views/education_subject.xml',
        'views/education_syllabus.xml',
        'views/education_amenities.xml',
        'views/application_analysis.xml',
        'reports/report.xml',
        'reports/student_id_card.xml',
        'reports/student_application_report.xml',
        'reports/faculty_id_card.xml',
        'reports/exam_marksheet.xml',
        'data/res.country.state.csv',
        'data/religion.religion.csv',
        'data/education.subject.csv',
    ],
    'demo': [
        'demo/education_data.xml',
    ],
    'images': ['static/description/banner.jpg'],
    'license': 'AGPL-3',
    'installable': True,
    'auto_install': False,
    'application': True,
}

# 'education_theme',
